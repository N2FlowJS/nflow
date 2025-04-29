// filepath: e:\git\nflow\pages\api\knowledge\[id]\files\[fileId]\download.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../../lib/prisma';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types'; // You might need to install this: npm install mime-types @types/mime-types

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id: knowledgeId, fileId } = req.query;

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    if (!knowledgeId || typeof knowledgeId !== 'string' || !fileId || typeof fileId !== 'string') {
        return res.status(400).json({ error: 'Knowledge ID and File ID are required' });
    }

    try {
        const file = await prisma.file.findUnique({
            where: { id: fileId, knowledgeId: knowledgeId },
        });

        if (!file || !file.path) {
            return res.status(404).json({ error: 'File not found or path is missing' });
        }

        // Assuming file.path stores the absolute or relative path on the server
        const filePath = path.resolve(file.path); // Ensure it's an absolute path

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`File not found at path: ${filePath}`);
            return res.status(404).json({ error: 'File not found on server' });
        }

        // Get file stats to set Content-Length
        const stats = fs.statSync(filePath);
        const contentType = mime.lookup(file.originalName) || file.mimetype || 'application/octet-stream';

        // Set headers for download/preview
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', stats.size.toString());
        // Use 'inline' for preview, 'attachment' for forced download
        // For images/PDFs, 'inline' is usually preferred for preview
        const disposition = contentType.startsWith('image/') || contentType === 'application/pdf'
            ? 'inline'
            : 'attachment';
        res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(file.originalName)}"`);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (err) => {
            console.error('Error streaming file:', err);
            // Avoid sending another response if headers already sent
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error reading file' });
            } else {
                // If headers are sent, we might just end the response or log
                res.end();
            }
        });

    } catch (error: unknown) {
        console.error('Error fetching file details:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}