import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { parseAuthHeader, verifyToken } from '../../../lib/auth';
import { createCustomNodePackage } from '../../../packages/custom-node/definition';
import * as fs from 'fs';
import * as path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get token from Authorization header
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Verify token
  const payload = await verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = payload.userId;

  switch (req.method) {
    case 'GET':
      try {
        // Get all custom nodes for the user (and team nodes if user is in teams)
        const userTeams = await prisma.memberTeam.findMany({
          where: { userId },
          select: { teamId: true }
        });
        const teamIds = userTeams.map(mt => mt.teamId);

        const customNodes = await prisma.customNode.findMany({
          where: {
            OR: [
              { createdById: userId },
              { teamId: { in: teamIds } }
            ],
            isActive: true
          },
          orderBy: { updatedAt: 'desc' }
        });

        res.status(200).json(customNodes);
      } catch (error) {
        console.error('Error fetching custom nodes:', error);
        res.status(500).json({ error: 'Failed to fetch custom nodes' });
      }
      break;

    case 'POST':
      try {
        const { name, description, code, inputPorts, outputPorts, icon, category, teamId } = req.body;

        // Validate required fields
        if (!name || !code || !inputPorts || !outputPorts) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // If teamId is provided, check if user is a member of that team
        if (teamId) {
          const teamMember = await prisma.memberTeam.findFirst({
            where: { userId, teamId }
          });
          if (!teamMember) {
            return res.status(403).json({ error: 'Not authorized to create nodes for this team' });
          }
        }

        // Create the custom node in database first to get the ID
        const customNode = await prisma.customNode.create({
          data: {
            name,
            description: description || '',
            code,
            inputPorts,
            outputPorts,
            icon,
            category: category || 'custom',
            createdById: userId,
            teamId
          }
        });

        // Create the package files
        try {
          const packageInfo = createCustomNodePackage({
            ...customNode,
            inputPorts: customNode.inputPorts as Array<{name: string, type: string, required: boolean}>,
            outputPorts: customNode.outputPorts as Array<{name: string, type: string}>,
            icon: customNode.icon || undefined,
            teamId: customNode.teamId || undefined,
          });

          // Ensure the package directory exists
          if (!fs.existsSync(packageInfo.packageDir)) {
            fs.mkdirSync(packageInfo.packageDir, { recursive: true });
          }

          // Write all package files
          Object.entries(packageInfo.files).forEach(([filename, content]) => {
            const filePath = path.join(packageInfo.packageDir, filename);
            fs.writeFileSync(filePath, content, 'utf8');
          });

          console.log(`Created custom node package: ${packageInfo.packageName}`);

        } catch (fileError) {
          console.error('Error creating package files:', fileError);
          // Don't fail the request if file creation fails, but log it
        }

        res.status(201).json(customNode);
      } catch (error) {
        console.error('Error creating custom node:', error);
        res.status(500).json({ error: 'Failed to create custom node' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
