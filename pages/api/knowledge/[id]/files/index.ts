import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { Prisma } from '@prisma/client'; // Add this import for Prisma types
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads with knowledge-specific folders
const upload = (knowledgeId: string) => multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // Create the base uploads directory if it doesn't exist
      const baseUploadDir = path.join(process.cwd(), 'uploads','knowledge');
      if (!fs.existsSync(baseUploadDir)) {
        fs.mkdirSync(baseUploadDir, { recursive: true });
      }
      
      // Create a knowledge-specific directory
      const knowledgeUploadDir = path.join(baseUploadDir, knowledgeId);
      if (!fs.existsSync(knowledgeUploadDir)) {
        fs.mkdirSync(knowledgeUploadDir, { recursive: true });
      }
      
      cb(null, knowledgeUploadDir);
    },
    filename: function (req, file, cb) {
      // Sanitize the file name to ensure it's correctly handled
      // Use UUID for the actual filename to avoid any encoding issues
      const uniqueFilename = uuidv4() + path.extname(file.originalname);
      cb(null, uniqueFilename);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Helper to run multer middleware
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        console.error("Multer error:", result);
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export const config = {
  api: {
    bodyParser: false, // Disabling body parsing as multer will handle it
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Valid knowledge ID is required' });
  }

  // Check if knowledge exists
  const knowledge = await prisma.knowledge.findUnique({
    where: { id },
  });

  if (!knowledge) {
    return res.status(404).json({ error: 'Knowledge item not found' });
  }

  // GET - Fetch all files for a knowledge item
  if (req.method === 'GET') {
    try {
      const files = await prisma.file.findMany({
        where: { knowledgeId: id },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json(files);
    } catch (error) {
      console.error('Request error', error);
      return res.status(500).json({ error: 'Error fetching files' });
    }
  }

  // POST - Upload new file(s) for a knowledge item
  if (req.method === 'POST') {
    try {
      console.log("Processing file upload for knowledge:", id);
      
      // Extract form fields first to get fileName
      const uploadWithFields = upload(id).fields([
        { name: 'file', maxCount: 10 },
        { name: 'fileName', maxCount: 1 }
      ]);
      
      await runMiddleware(req, res, uploadWithFields);
      
      // @ts-ignore - Added by multer
      const files = req.files?.file;
      // @ts-ignore - Access the fileName from form fields
      const fileName = req.body?.fileName;
      
      console.log("Files received:", files);
      console.log("Custom file name received:", fileName);
      
      if (!files || files.length === 0) {
        console.error("No files received in request");
        return res.status(400).json({ error: 'No files uploaded' });
      }

      console.log(`Received ${files.length} files`);
      // Get the knowledge config if it exists
      const knowledge = await prisma.knowledge.findUnique({
        where: { id },
      });      
      // Create records for all uploaded files
      const fileRecords = await Promise.all(
        files.map(async (file: any) => {
          // Use custom fileName if provided, otherwise use original name from file
          const originalName = fileName || file.originalname;
          // Safely encode the original filename to handle Unicode characters
          
          // Fix the config type issue by properly handling the JSON field
          const fileConfig = knowledge?.config 
            ? knowledge.config as Prisma.InputJsonValue
            : undefined;

          return prisma.file.create({
            data: {
              filename: file.filename,
              originalName: originalName, // Store safely encoded filename (now using custom name if provided)
              path: file.path,
              mimetype: file.mimetype,
              size: file.size,
              knowledgeId: id,
              config: fileConfig, // Fixed: proper type casting for Prisma JSON field
            }
          });
        })
      );

      console.log(`Created ${fileRecords.length} file records`);

      return res.status(201).json(fileRecords);
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ 
        error: 'Error uploading file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
