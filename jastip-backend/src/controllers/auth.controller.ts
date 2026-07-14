import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, phoneNumber } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        phoneNumber
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '1d' }
    );

    res.status(201).json({ user, token });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'This email is already registered.' });
    }
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({ user, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
