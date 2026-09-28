import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import Routes
import authRoutes from './routes/auth';
import networkRoutes from './routes/network';
import reportsRoutes from './routes/reports';
import incidentsRoutes from './routes/incidents';
import analyticsRoutes from './routes/analytics';
import aiRoutes from './routes/ai';
import simulatorRoutes from './routes/simulator';

const app = express();
const PORT = process.env.PORT || 5000;

// Security and middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path !== '/api/network/ping') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/simulator', simulatorRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'NetSense Campus',
    version: '1.0.0',
    gemini_ai_configured: !!process.env.GEMINI_API_KEY,
    database_mode: process.env.SUPABASE_URL ? 'SUPABASE_POSTGRES' : 'IN_MEMORY_PERSISTENCE',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend build if production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred on the server',
    },
  });
});

app.listen(PORT, () => {
  console.log(`
  ===============================================================
    NETSENSE CAMPUS - INTELLIGENT NETWORK OPERATIONS SERVER
  ===============================================================
    Status:   ONLINE (Port ${PORT})
    Database: Dual-mode active (Supabase ready + InMemory Store)
    Gemini AI: ${process.env.GEMINI_API_KEY ? 'Live API Key Connected' : 'Heuristic Intelligence Active (Set GEMINI_API_KEY for Live Gemini)'}
    APIs:     http://localhost:${PORT}/api/health
  ===============================================================
  `);
});

export default app;
