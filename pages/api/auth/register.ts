import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { hashPassword, generateToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, code, description } = req.body;

    // Validate required fields
    if (!name || !email || !password || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user with email already exists
    const existingUserByEmail = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUserByEmail) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Check if user with code already exists
    const existingUserByCode = await prisma.user.findFirst({
      where: { code }
    });

    if (existingUserByCode) {
      return res.status(409).json({ error: 'User code already in use' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        code,
        password: hashedPassword,
        description: description || '',
        permission: "owner"
      }
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      permission: user.permission
    });

    // Return user data (excluding password) and token
    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        code: user.code,
        description: user.description,
        permission: user.permission
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
}
