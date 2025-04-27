import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@lib/prisma';
import { generateToken } from '@lib/auth';

async function getAccessToken(provider: string, code: string) {
  if (provider === 'google') {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code'
      })
    });
    return res.json();
  }
  if (provider === 'github') {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        redirect_uri: process.env.GITHUB_REDIRECT_URI!
      })
    });
    return res.json();
  }
  throw new Error('Unsupported provider');
}

async function getUserInfo(provider: string, accessToken: string) {
  if (provider === 'google') {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return res.json();
  }
  if (provider === 'github') {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const user = await res.json();
    // Get email
    if (!user.email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const emails = await emailRes.json();
      user.email = Array.isArray(emails) ? emails.find((e: any) => e.primary)?.email : undefined;
    }
    return user;
  }
  throw new Error('Unsupported provider');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider, code } = req.query;
  if (req.method !== 'GET') return res.status(405).end();
  if (!provider || !code || typeof provider !== 'string' || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing provider or code' });
  }

  try {
    const tokenData = await getAccessToken(provider, code);
    const accessToken = tokenData.access_token;
    if (!accessToken) return res.status(400).json({ error: 'Failed to get access token' });

    const userInfo = await getUserInfo(provider, accessToken);

    // Find or create user in DB
    let user = await prisma.user.findFirst({ where: { email: userInfo.email } });
    if (!user) {
      // Nếu chưa có tài khoản, tạo mới
      user = await prisma.user.create({
        data: {
          name: userInfo.name || userInfo.login || userInfo.email,
          email: userInfo.email,
          code: userInfo.id?.toString() || userInfo.email,
          password: '', // No password for OAuth users
          description: '',
          permission: 'developer'
        }
      });
    }

    // Generate JWT
    const jwt = generateToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      permission: user.permission
    });

    // Redirect to frontend with token (or set cookie)
    res.redirect(`/?token=${jwt}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth login failed' });
  }
}
