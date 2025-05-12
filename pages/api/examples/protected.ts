import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuth } from '../../../lib/apiAuth';

/**
 * Protected API endpoint example that requires API token authentication
 */
async function handler(req: NextApiRequest, res: NextApiResponse, user: any) {
  // The handler only runs if authentication was successful
  // The authenticated user is available as the third parameter

  return res.status(200).json({
    message: "You have successfully accessed a protected API endpoint",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    timestamp: new Date().toISOString()
  });
}

// Wrap the handler with API authentication
export default withApiAuth(handler);
