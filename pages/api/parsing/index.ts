import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

/**
 * API handler for managing file parsing tasks.
 *
 * This handler supports the following HTTP methods:
 * - `GET`: Retrieves all parsing tasks, optionally filtered by status.
 * - `POST`: Creates a new parsing task for a specified file.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 *
 * ### GET Method:
 * Retrieves a list of parsing tasks, optionally filtered by the `status` query parameter.
 * The response includes details about the associated file and the user who created the task.
 *
 * #### Query Parameters:
 * - `status` (optional): Filters tasks by their status (e.g., "pending", "completed").
 *
 * #### Response:
 * - `200 OK`: Returns an array of parsing tasks.
 * - `500 Internal Server Error`: If an error occurs while fetching tasks.
 *
 * ### POST Method:
 * Creates a new parsing task for a specified file. Requires authentication via a token in the `Authorization` header.
 *
 * #### Request Body:
 * - `fileId` (string, required): The ID of the file for which the parsing task is created.
 *
 * #### Response:
 * - `201 Created`: Returns the created parsing task and a success message.
 * - `400 Bad Request`: If the `fileId` is missing.
 * - `401 Unauthorized`: If authentication fails or the token is invalid.
 * - `404 Not Found`: If the specified file does not exist.
 * - `500 Internal Server Error`: If an error occurs while creating the task.
 *
 * ### Error Handling:
 * - Logs errors to the console for debugging purposes.
 * - Returns appropriate HTTP status codes and error messages for client and server errors.
 *
 * ### Notes:
 * - The `POST` method updates the file's parsing status to "pending".
 * - In a real-world application, a background job or worker would be triggered to process the parsing task.
 *
 * ### Allowed Methods:
 * - `GET`
 * - `POST`
 *
 * If an unsupported method is used, the handler responds with:
 * - `405 Method Not Allowed`: Indicates the method is not supported.
 */
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
