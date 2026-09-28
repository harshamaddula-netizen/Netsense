import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import {
  CreateIncidentSchema,
  UpdateIncidentSchema,
  CreateIncidentEventSchema,
} from '../validators/schemas';

const router = Router();

// GET all incidents
router.get('/', (req: Request, res: Response) => {
  const { status } = req.query;
  const incidents = db.getIncidents(typeof status === 'string' ? status : undefined);
  res.json({
    success: true,
    data: incidents,
    error: null,
  });
});

// GET single incident
router.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const incident = db.getIncidentById(id);
  if (!incident) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: 'Incident not found' },
    });
    return;
  }
  res.json({
    success: true,
    data: incident,
    error: null,
  });
});

// POST create incident
router.post('/', (req: Request, res: Response) => {
  const parsed = CreateIncidentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid incident fields' },
    });
    return;
  }

  const incident = db.createIncident({
    location_id: parsed.data.location_id,
    title: parsed.data.title,
    description: parsed.data.description,
    severity: parsed.data.severity,
    status: parsed.data.status,
    detected_at: new Date().toISOString(),
    source: parsed.data.source,
  });

  res.status(201).json({
    success: true,
    data: incident,
    error: null,
  });
});

// PATCH update incident
router.patch('/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const parsed = UpdateIncidentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid update parameters' },
    });
    return;
  }

  const updated = db.updateIncident(id, parsed.data);
  if (!updated) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: 'Incident not found' },
    });
    return;
  }

  // Log status change event if status was modified
  if (parsed.data.status) {
    db.addIncidentEvent(id, {
      event_type: 'STATUS_CHANGE',
      description: `Incident status transitioned to ${parsed.data.status}`,
      metadata: { new_status: parsed.data.status },
    });
  }

  res.json({
    success: true,
    data: updated,
    error: null,
  });
});

// POST add incident event
router.post('/:id/events', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const parsed = CreateIncidentEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid event data' },
    });
    return;
  }

  const event = db.addIncidentEvent(id, parsed.data);
  if (!event) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: 'Incident not found' },
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: event,
    error: null,
  });
});

export default router;
