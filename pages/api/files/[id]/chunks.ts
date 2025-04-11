import { NextApiRequest, NextApiResponse } from "next";
import { fetchTextChunksByFileId } from "../../../../lib/services/localVectorService";
import { parseAuthHeader, verifyToken } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Extract file ID from path
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Valid file ID is required' });
  }

  // Check authentication
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    // Verify file exists
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Fetch text chunks for the specified file
    const chunks = await fetchTextChunksByFileId(id);
    
    return res.status(200).json({ chunks });
  } catch (error) {
    console.error('Error fetching file chunks:', error);
    return res.status(500).json({ error: 'Failed to fetch file chunks' });
  }
}
