import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getConversationFlowState } from '../flows/until/getConversationFlowState';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid conversation ID' });
  }

  try {
    switch (method) {
      case 'GET':
        // Get conversation with messages
        const conversation = await prisma.conversation.findUnique({
          where: { id },
          include: { 
            messages: { 
              orderBy: { timestamp: 'asc' } 
            },
            agent: {
              select: { name: true, description: true }
            }
          }
        });
        
        if (!conversation) {
          return res.status(404).json({ error: 'Conversation not found' });
        }
        
        // Get flow state
        const flowState = await getConversationFlowState(id);
        
        return res.status(200).json({
          conversation,
          flowState,
          // Note: client should handle parsing of metadata JSON strings
        });
        
      case 'DELETE':
        // Delete conversation
        await prisma.conversation.delete({
          where: { id }
        });
        
        return res.status(200).json({ success: true, message: 'Conversation deleted' });
      
      case 'PATCH':
        // Update conversation title
        const { title } = req.body;
        
        if (!title) {
          return res.status(400).json({ error: 'Title is required' });
        }
        
        const updatedConversation = await prisma.conversation.update({
          where: { id },
          data: { title }
        });
        
        return res.status(200).json({
          success: true,
          conversation: updatedConversation
        });
        
      default:
        res.setHeader('Allow', ['GET', 'DELETE', 'PATCH']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Conversation API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
