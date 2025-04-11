import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Retrieve all parsing tasks
  if (req.method === 'GET') {
    try {
      // Support status filtering
      const { status } = req.query;
      
      // Create the where condition based on status if provided
      const where = status ? { status: status.toString() } : {};
      
      const tasks = await prisma.fileParsingTask.findMany({
        where,
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
              name: true,
              email: true,
              code: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return res.status(200).json(tasks);
    } catch (error) {
      console.error("Error fetching parsing tasks:", error);
      return res.status(500).json({ error: "Failed to fetch parsing tasks" });
    }
  }
  
  // POST - Create a new parsing task
  if (req.method === 'POST') {
    try {
      // Get token from Authorization header
      const token = parseAuthHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Verify token
      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      const { fileId } = req.body;
      
      if (!fileId) {
        return res.status(400).json({ error: 'File ID is required' });
      }
      
      // Check if file exists
      const file = await prisma.file.findUnique({
        where: { id: fileId },
      });
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Create a parsing task
      const task = await prisma.fileParsingTask.create({
        data: {
          status: 'pending',
          fileId: fileId,
          createdById: payload.userId
        },
        include: {
          file: {
            select: {
              id: true,
              originalName: true,
              mimetype: true
            }
          }
        }
      });
      
      // Update file parsing status
      await prisma.file.update({
        where: { id: fileId },
        data: {
          parsingStatus: 'pending'
        }
      });
      
      // In a real-world scenario, you'd trigger a worker or background job here
      
      return res.status(201).json({
        success: true,
        message: 'File parsing task created successfully',
        task
      });
    } catch (error) {
      console.error('Error creating parsing task:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to create parsing task' 
      });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
