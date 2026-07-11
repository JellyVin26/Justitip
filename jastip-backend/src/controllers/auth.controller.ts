import { Request, Response } from 'express';
import prisma from '../prisma';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, phoneNumber } = req.body;
    // Basic mock logic - normally hash password
    const user = await prisma.user.create({
      data: {
        email,
        password, // raw for mock
        name,
        role,
        phoneNumber
      }
    });
    res.status(201).json({ user, token: 'mock-jwt-token-123' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.status(200).json({ user, token: 'mock-jwt-token-123' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
