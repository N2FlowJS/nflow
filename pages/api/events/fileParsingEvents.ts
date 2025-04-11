import { NextApiRequest, NextApiResponse } from 'next';

// Store active connections
const clients = new Map<string, NextApiResponse>();

// Export function to send events to clients
export function sendFileParsingEvent(knowledgeId: string, data: any) {
  console.log(`[SSE Send] Attempting to send event to knowledge ID ${knowledgeId}. Data:`, JSON.stringify(data));
  console.log(`[SSE Send] Current client map size: ${clients.size}`);
  // console.log(`[SSE Send] Current clients keys:`, Array.from(clients.keys())); // Uncomment for deep debugging

  let sentCount = 0;
  // For each client interested in this knowledge ID
  clients.forEach((client, clientId) => {
    console.log(`[SSE Send] Checking client ${clientId} for knowledge ID ${knowledgeId}`);

    // Ensure clientId is treated as a string before calling startsWith
    const clientIdStr = String(clientId);
    const targetPrefix = `knowledge_${knowledgeId}_`;

    if (clientIdStr.startsWith(targetPrefix)) {
      try {
        console.log(`[SSE Send] Sending data to matching client: ${clientIdStr}`);
        client.write(`data: ${JSON.stringify(data)}\n\n`);
        sentCount++;
      } catch (error) {
        console.error(`[SSE Send] Error sending to client ${clientIdStr}:`, error);
        // Remove problematic clients
        clients.delete(clientId);
        console.log(`[SSE Send] Removed client ${clientIdStr} due to error. Remaining clients: ${clients.size}`);
      }
    } else {
      // console.log(`[SSE Send] Client ${clientIdStr} does not match prefix ${targetPrefix}`); // Uncomment for deep debugging
    }
  });

  console.log(`[SSE Send] Event sent to ${sentCount} clients for knowledge ID ${knowledgeId}`);

  // Log if no clients were found for this knowledge ID
  if (sentCount === 0 && clients.size > 0) {
    console.warn(`[SSE Send] No active clients found matching knowledge ID ${knowledgeId}. Total clients: ${clients.size}`);
  } else if (clients.size === 0) {
    console.warn(`[SSE Send] No clients connected at all.`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { knowledgeId } = req.query;
  console.log(`[SSE Connect] Received request for knowledgeId: ${knowledgeId}`); // Log received knowledgeId

  if (!knowledgeId || typeof knowledgeId !== 'string') {
    console.error('[SSE Connect] Missing or invalid knowledge ID');
    return res.status(400).json({ error: 'Knowledge ID is required' });
  }

  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET',
  });

  
  // Generate a unique client ID
  const clientId = `knowledge_${knowledgeId}_${Date.now()}`;
  console.log(`[SSE Connect] Generated clientId: ${clientId}`);
  
  // Send a properly formatted initial JSON message
  res.write(`event: init\ndata: ${JSON.stringify({ message: 'connect' })}\n\n`);
  
  // Ensure the response is sent immediately
  res.write('');
  
  // Store client connection
  clients.set(clientId, res);
  console.log(`[SSE Connect] Client connected: ${clientId}. Total clients: ${clients.size}`);

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ knowledgeId })}\n\n`);
  

  // Send a ping every 30 seconds to keep the connection alive
  const keepAliveInterval = setInterval(() => {
    try {
      res.write(`event: ping\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
    
    } catch (error) {
      console.error(`[SSE] Error sending ping to client ${clientId}:`, error);
      clearInterval(keepAliveInterval);
      clients.delete(clientId);
    }
  }, 30000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(keepAliveInterval);
    clients.delete(clientId);
    console.log(`[SSE Connect] Client disconnected: ${clientId}. Remaining clients: ${clients.size}`);
  });
}
