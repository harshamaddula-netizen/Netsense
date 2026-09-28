import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { geminiService } from '../services/geminiService';
import { ChatMessageInputSchema } from '../validators/schemas';

const router = Router();

// Chat with NetSense Assistant
router.post('/chat', async (req: Request, res: Response) => {
  const parsed = ChatMessageInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid chat input' },
    });
    return;
  }

  const { message, location_id, diagnostics } = parsed.data;
  const sessionId = parsed.data.session_id || 'default-session';

  // Gather active incidents nearby
  const activeIncidents = location_id
    ? db.getIncidents().filter((i) => i.location_id === location_id && i.status !== 'RESOLVED')
    : db.getIncidents().filter((i) => i.status !== 'RESOLVED');

  const location = location_id ? db.getLocationById(location_id) : undefined;

  // Save user message to session
  db.addChatMessage(sessionId, 'user', message, {
    location_id,
    diagnostics_attached: !!diagnostics,
  });

  try {
    const aiResponse = await geminiService.chat({
      message,
      locationName: location?.name,
      diagnostics: diagnostics || null,
      activeIncidents,
    });

    // Save assistant reply
    const assistantMsg = db.addChatMessage(sessionId, 'assistant', aiResponse.reply, {
      action_prompt: aiResponse.action_prompt,
    });

    res.json({
      success: true,
      data: {
        session_id: sessionId,
        message: assistantMsg,
        action_prompt: aiResponse.action_prompt,
      },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'AI_ERROR', message: error.message || 'Error processing AI chat' },
    });
  }
});

// Structured Troubleshooter (15.1)
router.post('/troubleshoot', async (req: Request, res: Response) => {
  const { problem, location_id, deviceType, diagnostics } = req.body;

  if (!problem) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Problem description is required' },
    });
    return;
  }

  const location = location_id ? db.getLocationById(location_id) : undefined;
  const activeIncidents = location_id
    ? db.getIncidents().filter((i) => i.location_id === location_id && i.status !== 'RESOLVED')
    : [];

  try {
    const response = await geminiService.troubleshoot({
      problem,
      location: location?.name,
      deviceType: deviceType || 'Laptop',
      diagnostics: diagnostics || null,
      activeIncidents,
    });

    res.json({
      success: true,
      data: response,
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'AI_ERROR', message: error.message },
    });
  }
});

// Operational Incident Summary (15.2)
router.post('/incident-summary', async (req: Request, res: Response) => {
  const { incidentId } = req.body;
  const incident = db.getIncidentById(incidentId);

  if (!incident) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: 'Incident not found' },
    });
    return;
  }

  const location = db.getLocationById(incident.location_id);
  const reports = incident.correlated_reports || [];
  const measurements = db.getMeasurements(incident.location_id, 10);

  try {
    const summary = await geminiService.summarizeIncident({
      incident,
      reports,
      measurements,
      location,
    });

    // Cache on incident record
    db.updateIncident(incident.id, { ai_summary: summary });

    res.json({
      success: true,
      data: summary,
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'AI_ERROR', message: error.message },
    });
  }
});

// Campus Network Analysis (15.3)
router.post('/analyze-network', async (req: Request, res: Response) => {
  const locations = db.getLocations();
  const recentIncidents = db.getIncidents().slice(0, 5);
  const metrics = db.getMeasurements(undefined, 20);

  try {
    const analysis = await geminiService.analyzeCampusNetwork({
      overallStatus: 'NORMAL',
      locations,
      recentIncidents,
      metrics,
    });

    res.json({
      success: true,
      data: analysis,
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'AI_ERROR', message: error.message },
    });
  }
});

export default router;
