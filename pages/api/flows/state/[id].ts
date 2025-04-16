import type { NextApiRequest, NextApiResponse } from 'next';
import { getConversationFlowState } from '../until/getConversationFlowState';
import { prisma } from '../../../../lib/prisma';

// This endpoint fetches detailed flow state information when needed
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        message: 'Method not allowed',
        type: 'invalid_request_error',
        code: 'method_not_allowed',
      },
    });
  }

  try {
    // Extract the state ID from the request
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: {
          message: 'Invalid state ID',
          type: 'invalid_request_error',
          code: 'missing_parameter',
        },
      });
    }

    // Optimize: Check if the conversation exists before getting the state
    // This avoids a second lookup in getConversationFlowState
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: {
        agentId: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        error: {
          message: 'Conversation not found',
          type: 'invalid_request_error',
          code: 'not_found',
        },
      });
    }

    // Authenticate request if needed (pseudo-code)
    // if (!hasPermission(req.user, conversation)) {
    //   return res.status(403).json({
    //     error: {
    //       message: 'Not authorized to access this conversation',
    //       type: 'access_denied_error',
    //       code: 'permission_denied'
    //     }
    //   });
    // }

    // Get flow state - should be fast due to caching
    const flowState = await getConversationFlowState(id);

    if (!flowState) {
      return res.status(404).json({
        error: {
          message: 'Flow state not found',
          type: 'invalid_request_error',
          code: 'not_found',
        },
      });
    }

    // Return the flow state with minimal metadata
    return res.status(200).json({
      id,
      flowState,
      metadata: {
        agentId: conversation.agentId,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching flow state:', error);
    return res.status(500).json({
      error: {
        message: 'Failed to fetch flow state',
        detail: error instanceof Error ? error.message : 'Unknown error',
        type: 'server_error',
        code: 'internal_error',
      },
    });
  }
}
