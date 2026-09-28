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

// API Routes (Mounted under both /api and root to handle direct and rewritten requests seamlessly)
const apiModules: [string, any][] = [
  ['/auth', authRoutes],
  ['/network', networkRoutes],
  ['/reports', reportsRoutes],
  ['/incidents', incidentsRoutes],
  ['/analytics', analyticsRoutes],
  ['/ai', aiRoutes],
  ['/simulator', simulatorRoutes],
];

for (const [routePath, routeHandler] of apiModules) {
  app.use(`/api${routePath}`, routeHandler);
  app.use(routePath, routeHandler);
}

// Health check endpoint
const handleHealth = (req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'NetSense Campus',
    version: '1.0.0',
    gemini_ai_configured: !!process.env.GEMINI_API_KEY,
    database_mode: process.env.SUPABASE_URL ? 'SUPABASE_POSTGRES' : 'IN_MEMORY_PERSISTENCE',
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', handleHealth);
app.get('/health', handleHealth);
app.get('/api', handleHealth);

// Serve frontend build if standalone production (not on Vercel serverless)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// API 404 handler - ensures all unmatched API endpoints always return JSON, never HTML
app.use(['/api', '/api/*'], (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: 'NOT_FOUND',
      message: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`,
    },
  });
});

// Global error handling middleware - always returns JSON
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({
    success: false,
    data: null,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred on the server',
    },
  });
});

// Only bind server port in standalone mode (Vercel Serverless executes the exported handler directly)
if (!process.env.VERCEL) {
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
}

export default app;
