import { NextApiRequest, NextApiResponse } from 'next';
import { sendFileParsingEvent } from './fileParsingEvents'; // Import the actual sender

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { knowledgeId, eventData } = req.body;

  if (!knowledgeId || typeof knowledgeId !== 'string') {
    console.error('[API Send Event] Missing or invalid knowledge ID in request body');
    res.status(400).json({ error: 'Knowledge ID is required in the request body' });
    return;
  }

  if (!eventData || typeof eventData !== 'object') {
    console.error('[API Send Event] Missing or invalid event data in request body');
    res.status(400).json({ error: 'Event data object is required in the request body' });
    return;
  }

  try {
    // Optional: Add security check here, e.g., verify a secret header
    // if (req.headers['x-internal-secret'] !== process.env.INTERNAL_WORKER_SECRET) {
    //   console.warn('[API Send Event] Unauthorized attempt to send event');
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

    console.log(`[API Send Event] Received request to send event for knowledge ID ${knowledgeId}`);
    sendFileParsingEvent(knowledgeId, eventData);
    res.status(200).json({ message: 'Event sent successfully' });
    return;
  } catch (error: unknown) {
    console.error(`[API Send Event] Error sending event for knowledge ID ${knowledgeId}:`, error);
    res.status(500).json({ error: 'Internal server error while sending event' });
    return;
  }
}
