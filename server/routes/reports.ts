import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { correlationService } from '../services/correlationService';
import { CreateReportSchema, UpdateReportSchema } from '../validators/schemas';

const router = Router();

// GET all reports with optional filters
router.get('/', (req: Request, res: Response) => {
  const { userId, locationId, status } = req.query;
  const reports = db.getReports(
    typeof userId === 'string' ? userId : undefined,
    typeof locationId === 'string' ? locationId : undefined,
    typeof status === 'string' ? status : undefined
  );
  res.json({
    success: true,
    data: reports,
    error: null,
  });
});

// GET single report
router.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const report = db.getReportById(id);
  if (!report) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: 'Report not found' },
    });
    return;
  }
  res.json({
    success: true,
    data: report,
    error: null,
  });
});

// POST create report (triggers correlation)
router.post('/', (req: Request, res: Response) => {
  const parsed = CreateReportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message || 'Invalid report fields',
      },
    });
    return;
  }

  // Ensure default demo student user if not set
  const userId = parsed.data.user_id || '33333333-3333-3333-3333-333333333301';

  const report = db.createReport({
    user_id: userId,
    location_id: parsed.data.location_id,
    category: parsed.data.category,
    description: parsed.data.description,
    severity: parsed.data.severity,
    device_type: parsed.data.device_type,
    diagnostic_data: parsed.data.diagnostic_data || null,
    status: 'SUBMITTED',
  });

  // Run automated incident correlation
  const correlation = correlationService.correlateReport(report);

  // Re-fetch report to get updated status and incident_id
  const updatedReport = db.getReportById(report.id);

  res.status(201).json({
    success: true,
    data: {
      report: updatedReport,
      correlation,
    },
    error: null,
  });
});

// PATCH update report
router.patch('/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const parsed = UpdateReportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid update fields' },
    });
    return;
  }

  const updated = db.updateReport(id, parsed.data);
  if (!updated) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: 'Report not found' },
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
