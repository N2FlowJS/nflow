import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'Invalid conversation ID' });
    return;
  }

  try {
    switch (method) {
      case 'GET': {
        // Get conversation with messages
        const conversation = await prisma.conversation.findUnique({
          where: { id },
          include: {
            messages: {
              orderBy: { timestamp: 'asc' },
            },
            agent: {
              select: { name: true, description: true },
            },
          },
        });

        if (!conversation) {
          res.status(404).json({ error: 'Conversation not found' });
          return;
        }

        // Get flow state

        res.status(200).json(conversation);
        return;
      }

      case 'DELETE': {
        // Delete conversation
        await prisma.conversation.delete({
          where: { id },
        });

        res.status(200).json({ success: true, message: 'Conversation deleted' });
        return;
      }
      case 'PATCH': {
        // Update conversation title
        const { title } = req.body;

        if (!title) {
          res.status(400).json({ error: 'Title is required' });
          return;
        }

        const updatedConversation = await prisma.conversation.update({
          where: { id },
          data: { title },
        });

        res.status(200).json({
          success: true,
          conversation: updatedConversation,
        });
        return;
      }
      default: {
        res.setHeader('Allow', ['GET', 'DELETE', 'PATCH']);
        res.status(405).json({ error: `Method ${method} Not Allowed` });
        return;
      }
    }
  } catch (error: unknown) {
    console.error('Conversation API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
    return;
  }
}
