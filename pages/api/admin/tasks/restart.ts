
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For GET requests, allow without authentication
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Use POST to restart failed tasks'
    });
  }
  
  // For all other methods, require authentication
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // POST - Restart failed tasks
  if (req.method === 'POST') {
    try {
      // Find all failed tasks
      const failedTasks = await prisma.fileParsingTask.findMany({
        where: { status: 'failed' },
        include: { file: true }
      });
      
      // Create new tasks for each failed file
      const results = await Promise.all(
        failedTasks.map(async (task) => {
          // Create a new parsing task
          const newTask = await prisma.fileParsingTask.create({
            data: {
              status: 'pending',
              fileId: task.fileId,
              createdById: payload.userId
            }
          });
          
          // Update file status
          await prisma.file.update({
            where: { id: task.fileId },
            data: { parsingStatus: 'pending' }
          });
          
          return {
            originalTaskId: task.id,
            newTaskId: newTask.id,
            fileName: task.file.originalName
          };
        })
      );
      
      return res.status(200).json({
        success: true,
        message: `Restarted ${results.length} failed tasks`,
        tasks: results
      });
    } catch (error) {
      console.error('Error restarting tasks:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to restart tasks' 
      });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
