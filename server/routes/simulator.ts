import { Router, Request, Response } from 'express';
import { simulationService } from '../services/simulationService';
import { SimulatorRequestSchema } from '../validators/schemas';

const router = Router();

// Generic trigger scenario endpoint
router.post('/scenario', (req: Request, res: Response) => {
  const parsed = SimulatorRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid simulation parameters' },
    });
    return;
  }

  try {
    const result = simulationService.triggerScenario(
      parsed.data.scenario,
      parsed.data.target_location_id,
      parsed.data.duration_minutes
    );
    res.json({
      success: true,
      data: {
        ...result,
        tag: 'DEMO DATA',
        disclaimer: 'This telemetry was generated synthetically by the NetSense Campus simulation engine for demonstration purposes.',
      },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'SIMULATOR_ERROR', message: error.message },
    });
  }
});

// Shorthand route: Normal
router.post('/normal', (req: Request, res: Response) => {
  const result = simulationService.triggerScenario('NORMAL');
  res.json({ success: true, data: { ...result, tag: 'DEMO DATA' }, error: null });
});

// Shorthand route: High Load
router.post('/high-load', (req: Request, res: Response) => {
  const { locationId } = req.body;
  const result = simulationService.triggerScenario('HIGH_LOAD', locationId);
  res.json({ success: true, data: { ...result, tag: 'DEMO DATA' }, error: null });
});

// Shorthand route: High Latency
router.post('/high-latency', (req: Request, res: Response) => {
  const { locationId } = req.body;
  const result = simulationService.triggerScenario('HIGH_LATENCY', locationId);
  res.json({ success: true, data: { ...result, tag: 'DEMO DATA' }, error: null });
});

// Shorthand route: Packet Loss
router.post('/packet-loss', (req: Request, res: Response) => {
  const { locationId } = req.body;
  const result = simulationService.triggerScenario('PACKET_LOSS', locationId);
  res.json({ success: true, data: { ...result, tag: 'DEMO DATA' }, error: null });
});

// Shorthand route: Outage
router.post('/outage', (req: Request, res: Response) => {
  const { locationId } = req.body;
  const result = simulationService.triggerScenario('OUTAGE', locationId);
  res.json({ success: true, data: { ...result, tag: 'DEMO DATA' }, error: null });
});

// Shorthand route: Crowd Burst
router.post('/crowd-burst', (req: Request, res: Response) => {
  const { locationId } = req.body;
  const result = simulationService.triggerScenario('CROWD_BURST', locationId);
  res.json({ success: true, data: { ...result, tag: 'DEMO DATA' }, error: null });
});

export default router;
