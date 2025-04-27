import { NextApiRequest, NextApiResponse } from 'next';

const OAUTH_CONFIG = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: process.env.GOOGLE_CLIENT_ID!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI!,
    scope: 'openid email profile',
    responseType: 'code',
    extra: { access_type: 'offline', prompt: 'consent' }
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    clientId: process.env.GITHUB_CLIENT_ID!,
    redirectUri: process.env.GITHUB_REDIRECT_URI!,
    scope: 'read:user user:email',
    responseType: 'code',
    extra: {}
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider } = req.query;
  if (req.method !== 'GET') return res.status(405).end();

  if (!provider || typeof provider !== 'string' || !(provider in OAUTH_CONFIG)) {
    return res.status(400).json({ error: 'Invalid provider' });
  }

  const config = OAUTH_CONFIG[provider as 'google' | 'github'];
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: config.responseType,
    scope: config.scope,
    ...config.extra
  }).toString();

  res.redirect(`${config.authUrl}?${params}`);
}
