import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Valid parsing task ID is required' });
    return;
  }

  // GET - Retrieve parsing task details
  if (req.method === 'GET') {
    try {
      const task = await prisma.fileParsingTask.findUnique({
        where: { id },
        include: {
          file: {
            select: {
              id: true,
              originalName: true,
              mimetype: true,
              size: true,
              parsingStatus: true,
              knowledge: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      if (!task) {
        res.status(404).json({ error: 'Parsing task not found' });
        return;
      }
      
      res.status(200).json(task);
      return;
    } catch (error: unknown) {
      console.error("Error fetching parsing task:", error);
      res.status(500).json({ error: "Failed to fetch parsing task" });
      return;
    }
  }
  
  // PATCH - Update parsing task status
  if (req.method === 'PATCH') {
    try {
      // Get token from Authorization header
      const token = parseAuthHeader(req.headers.authorization);
      if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      // Verify token
      const payload = await verifyToken(token);
      if (!payload) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      
      const { status, message, fileContent } = req.body;
      
      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }
      
      if (!['pending', 'processing', 'completed', 'failed'].includes(status)) {
        res.status(400).json({ error: 'Invalid status value' });
        return;
      }
      
      // Get the task
      const existingTask = await prisma.fileParsingTask.findUnique({
        where: { id },
        include: {
          file: true
        }
      });
      
      if (!existingTask) {
        res.status(404).json({ error: 'Parsing task not found' });
        return;
      }
      
      // Update task data
      const updateData: any = {
        status,
        updatedAt: new Date()
      };
      
      if (status === 'completed' || status === 'failed') {
        updateData.completedAt = new Date();
      }
      
      if (message) {
        updateData.message = message;  // Use message instead of errorMessage for all task information
      }
      
      // Update the task
      const updatedTask = await prisma.fileParsingTask.update({
        where: { id },
        data: updateData,
        include: {
          file: true
        }
      });
      
      // File update data
      const fileUpdateData: any = {
        parsingStatus: status === 'completed' ? 'completed' : 
                       status === 'failed' ? 'failed' : 
                       status === 'processing' ? 'processing' : 'pending'
      };
      
      // Add content to the file if provided and status is completed
      if (status === 'completed' && fileContent) {
        fileUpdateData.content = fileContent;
      }
      
      // Also update the file's parsing status and content if applicable
      await prisma.file.update({
        where: { id: existingTask.file.id },
        data: fileUpdateData
      });
      
      res.status(200).json({
        success: true,
        message: 'Parsing task updated successfully',
        task: updatedTask
      });
      return;
    } catch (error: unknown) {
      console.error('Error updating parsing task:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update parsing task' 
      });
      return;
    }
  }
  
  // DELETE - Delete a parsing task
  if (req.method === 'DELETE') {
    try {
      // Get token from Authorization header
      const token = parseAuthHeader(req.headers.authorization);
      if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      // Verify token
      const payload = await verifyToken(token);
      if (!payload) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      
      // Check if task exists
      const task = await prisma.fileParsingTask.findUnique({
        where: { id },
        include: {
          file: true
        }
      });
      
      if (!task) {
        res.status(404).json({ error: 'Parsing task not found' });
        return;
      }
      
      // Delete the task
      await prisma.fileParsingTask.delete({
        where: { id }
      });
      
      // Reset the file's parsing status if this was the only task
      const remainingTasks = await prisma.fileParsingTask.count({
        where: { fileId: task.fileId }
      });
      
      if (remainingTasks === 0) {
        await prisma.file.update({
          where: { id: task.fileId },
          data: {
            parsingStatus: null
          }
        });
      }
      
      res.status(204).end();
      return;
    } catch (error: unknown) {
      console.error('Error deleting parsing task:', error);
      res.status(500).json({ error: 'Failed to delete parsing task' });
      return;
    }
  }
  
  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
  return;
}
