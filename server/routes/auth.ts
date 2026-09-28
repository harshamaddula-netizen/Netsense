import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { AuthService } from '../services/authService';

const router = Router();

// Current active session user (defaulting to Alex Chen, but switchable)
let currentUserId = '33333333-3333-3333-3333-333333333301';

function getUserIdFromRequest(req: Request): string {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const userId = db.getUserIdBySessionToken(token);
    if (userId) return userId;
  }
  return currentUserId;
}

// Current authenticated user
router.get('/me', (req: Request, res: Response) => {
  const effectiveUserId = getUserIdFromRequest(req);
  const profile = db.getProfileById(effectiveUserId) || db.getProfiles()[0];
  res.json({
    success: true,
    data: profile,
    error: null,
  });
});

// Demo profiles list
router.get('/profiles', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: db.getProfiles(),
    error: null,
  });
});

// Real User Registration with Secure Cryptographic Password Hashing
router.post('/register', (req: Request, res: Response) => {
  const { full_name, email, phone_number, password, confirm_password, role, department, year_of_study } = req.body;

  // 1. Validate full name
  if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Full name is required (minimum 2 characters).' },
    });
    return;
  }

  // 2. Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'A valid email address is required.' },
    });
    return;
  }

  // 3. Validate password
  if (!password || typeof password !== 'string' || password.length < 8) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters long.' },
    });
    return;
  }

  // 4. Validate password confirmation
  if (password !== confirm_password) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Passwords do not match. Please re-enter matching passwords.' },
    });
    return;
  }

  // 5. Check if email already registered
  const existingAccount = db.getAccountByEmail(email);
  if (existingAccount) {
    res.status(409).json({
      success: false,
      data: null,
      error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email address already exists. Please log in.' },
    });
    return;
  }

  // 6. Cryptographically hash password with salt (PBKDF2-SHA512)
  const { hash, salt } = AuthService.hashPassword(password);

  // 7. Register user in database
  const newProfile = db.registerUser({
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    phone_number: phone_number?.trim() || null,
    password_hash: hash,
    password_salt: salt,
    role: role || 'student',
    department: department || 'Campus Network User',
    year_of_study: year_of_study ? parseInt(year_of_study, 10) : null,
  });

  // 8. Generate session token
  const token = db.createSession(newProfile.id);
  currentUserId = newProfile.id;

  // Return user profile (strictly without password or hash) + token
  res.status(201).json({
    success: true,
    data: {
      user: newProfile,
      token,
    },
    error: null,
  });
});

// Real User Login with Password Verification
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'MISSING_CREDENTIALS', message: 'Email address and password are required.' },
    });
    return;
  }

  const account = db.getAccountByEmail(email);
  if (!account) {
    res.status(401).json({
      success: false,
      data: null,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
    return;
  }

  // Verify password using constant-time hash comparison
  const isMatch = AuthService.verifyPassword(password, account.password_hash, account.password_salt);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      data: null,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
    return;
  }

  const profile = db.getProfileById(account.user_id);
  if (!profile) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'USER_NOT_FOUND', message: 'User profile record not found.' },
    });
    return;
  }

  const token = db.createSession(profile.id);
  currentUserId = profile.id;

  res.json({
    success: true,
    data: {
      user: profile,
      token,
    },
    error: null,
  });
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    db.deleteSession(token);
  }
  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
    error: null,
  });
});

// Demo persona switcher (maintained for hackathon convenience)
router.post('/switch-persona', (req: Request, res: Response) => {
  const { profileId } = req.body;
  const profile = db.getProfileById(profileId);
  if (!profile) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: 'Demo profile not found' },
    });
    return;
  }
  currentUserId = profileId;
  const token = db.createSession(profileId);
  res.json({
    success: true,
    data: profile,
    token,
    error: null,
  });
});

// Update Current User Profile
router.patch('/profile', (req: Request, res: Response) => {
  const effectiveUserId = getUserIdFromRequest(req);
  const { full_name, email, phone_number, department, year_of_study, role } = req.body;
  const updated = db.updateProfile(effectiveUserId, {
    ...(full_name ? { full_name } : {}),
    ...(email ? { email } : {}),
    ...(phone_number !== undefined ? { phone_number } : {}),
    ...(department !== undefined ? { department } : {}),
    ...(year_of_study !== undefined ? { year_of_study: parseInt(year_of_study, 10) || null } : {}),
    ...(role ? { role } : {}),
  });

  if (!updated) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: 'Current user profile not found' },
    });
    return;
  }

  res.json({
    success: true,
    data: updated,
    error: null,
  });
});

export default router;
