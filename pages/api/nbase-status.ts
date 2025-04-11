import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint to check Nbase server status
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Nbase is enabled
  if (process.env.VECTOR_DB_TYPE !== 'nbase') {
    return res.status(200).json({ 
      status: 'disabled',
      message: 'Nbase is not enabled. Current vector DB type: ' + process.env.VECTOR_DB_TYPE
    });
  }

  try {
    // Fetch status from Nbase server
    const nbaseUrl = process.env.NBASE_URL || 'http://localhost:1307';
    const response = await fetch(`${nbaseUrl}/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        status: 'running',
        message: 'Nbase server is running',
        data
      });
    } else {
      return res.status(200).json({
        status: 'error',
        message: `Nbase server returned status: ${response.status} ${response.statusText}`
      });
    }
  } catch (error) {
    return res.status(200).json({
      status: 'error',
      message: `Failed to connect to Nbase server: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}
