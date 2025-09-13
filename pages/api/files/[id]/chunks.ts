import { NextApiRequest, NextApiResponse } from "next";
import { fetchTextChunksByFileId } from "../../../../lib/services/localVectorService";
import { parseAuthHeader, verifyToken } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  // Extract file ID from path
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Valid file ID is required' });
    return;
  }

  // Check authentication
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  
  const payload = await verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  try {
    // Verify file exists
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Fetch text chunks for the specified file
    const chunks = await fetchTextChunksByFileId(id);
    
    res.status(200).json({ chunks });
    return;
  } catch (error: unknown) {
    console.error('Error fetching file chunks:', error);
    res.status(500).json({ error: 'Failed to fetch file chunks' });
    return;
  }
}
