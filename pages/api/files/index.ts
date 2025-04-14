import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";

// This API route handles file-related operations
/**
 * API route handler for managing file-related operations.
 * 
 * This handler supports the following HTTP methods:
 * - `GET`: Retrieves a list of files along with their associated knowledge details.
 * 
 * @param req - The HTTP request object, which includes the method and any query parameters.
 * @param res - The HTTP response object used to send back the response.
 * 
 * @returns A JSON response:
 * - On success (`200`): An array of files, each including associated knowledge details (id, name, description).
 * - On failure (`500`): An error message indicating a failure to fetch files.
 * - On unsupported methods (`405`): A message indicating the method is not allowed.
 * 
 * @throws Logs an error to the console if fetching files fails.
 * 
 * @remarks
 * The files are fetched from the database using Prisma, ordered by their creation date in descending order.
 * The `knowledge` relationship is included with selected fields (id, name, description).
 * 
 * @example
 * // Example response on success:
 * [
 *   {
 *     id: 1,
 *     name: "File 1",
 *     createdAt: "2023-01-01T00:00:00.000Z",
 *     knowledge: {
 *       id: 101,
 *       name: "Knowledge 1",
 *       description: "Description of Knowledge 1"
 *     }
 *   },
 *   ...
 * ]
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const files = await prisma.file.findMany({
        include: {
          knowledge: {
            select: {
              id: true,
              name: true,
              description: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return res.status(200).json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      return res.status(500).json({ error: "Failed to fetch files" });
    }
  }
  
  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
