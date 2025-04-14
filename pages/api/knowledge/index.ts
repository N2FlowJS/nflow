import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

/**
 * API route handler for managing knowledge items.
 *
 * Handles both `GET` and `POST` requests:
 *
 * - `GET`: Fetches all knowledge items from the database, including their associated
 *   creators, users, teams, and files.
 *   - Response: Returns a JSON array of knowledge items with a 200 status code.
 *   - Error: Returns a 500 status code with an error message if fetching fails.
 *
 * - `POST`: Creates a new knowledge item in the database.
 *   - Requires an `Authorization` header with a valid token.
 *   - Request Body:
 *     - `name` (string, required): The name of the knowledge item.
 *     - `description` (string, required): A description of the knowledge item.
 *     - `userIds` (string[], optional): An array of user IDs to associate with the knowledge item.
 *     - `teamIds` (string[], optional): An array of team IDs to associate with the knowledge item.
 *   - Response: Returns the created knowledge item with a 201 status code.
 *   - Error: Returns a 401 status code for authentication errors, a 400 status code for
 *     validation errors, or a 500 status code for server errors.
 *
 * If the request method is not `GET` or `POST`, the handler responds with a 405 status code
 * and an `Allow` header specifying the allowed methods.
 *
 * @param req - The incoming HTTP request object.
 * @param res - The outgoing HTTP response object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const knowledgeItems = await prisma.knowledge.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              code: true
            }
          },
          users: {
            select: {
              id: true,
              name: true
            }
          },
          teams: {
            select: {
              id: true,
              name: true
            }
          },
          files: true
        }
      });
      
      return res.status(200).json(knowledgeItems);
    } catch (error) {
      console.error("Request error", error);
      return res.status(500).json({ error: "Error fetching knowledge" });
    }
  }
  
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
      
      const { name, description, userIds, teamIds } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
      }
      
      // Create knowledge with authenticated user as creator
      const knowledge = await prisma.knowledge.create({
        data: {
          name,
          description,
          // Associate with creator
          createdBy: {
            connect: { id: payload.userId }
          },
          // Associate with specified users if any
          ...(userIds && userIds.length > 0 && {
            users: {
              connect: userIds.map((id: string) => ({ id }))
            }
          }),
          // Associate with specified teams if any
          ...(teamIds && teamIds.length > 0 && {
            teams: {
              connect: teamIds.map((id: string) => ({ id }))
            }
          })
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              code: true
            }
          },
          users: true,
          teams: true
        }
      });
      
      return res.status(201).json(knowledge);
    } catch (error) {
      console.error('Error creating knowledge:', error);
      return res.status(500).json({ error: 'Error creating knowledge' });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
