// ==============================================================================
// NETSENSE CAMPUS - SECURE AUTHENTICATION & PASSWORD CRYPTOGRAPHY ENGINE
// Uses PBKDF2 (SHA-512, 100,000 iterations) with cryptographic 128-bit salts
// Passwords are never stored in plaintext and never exposed over API
// ==============================================================================

import crypto from 'crypto';

export interface HashedPassword {
  hash: string;
  salt: string;
}

export class AuthService {
  /**
   * Hashes a user-provided password using PBKDF2-HMAC-SHA512 with a cryptographically random salt.
   */
  public static hashPassword(password: string): HashedPassword {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { hash, salt };
  }

  /**
   * Verifies a plain text password against a stored PBKDF2 hash using constant-time comparison.
   */
  public static verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
    try {
      const computedHash = crypto.pbkdf2Sync(password, storedSalt, 100000, 64, 'sha512').toString('hex');
      const storedBuf = Buffer.from(storedHash, 'hex');
      const computedBuf = Buffer.from(computedHash, 'hex');

      if (storedBuf.length !== computedBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(storedBuf, computedBuf);
    } catch {
      return false;
    }
  }

  /**
   * Generates a secure 256-bit cryptographically random session token.
   */
  public static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
