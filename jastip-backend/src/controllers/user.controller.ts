// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../prisma';

export const followUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID of the user to follow
    // In a real app, followerId comes from req.user.id (JWT)
    // For prototype, we pass it in body
    const { followerId } = req.body; 

    if (!followerId) return res.status(400).json({ error: 'followerId is required' });

    const follow = await prisma.follows.create({
      data: {
        followerId,
        followingId: id,
      }
    });

    res.status(200).json({ message: 'User followed successfully', follow });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const { followerId } = req.body; 

    if (!followerId) return res.status(400).json({ error: 'followerId is required' });

    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id,
        }
      }
    });

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        avatarUrl: true,
        country: true,
        city: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            trips: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, avatarUrl, country, city, bio } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        phoneNumber,
        avatarUrl,
        country,
        city,
        bio,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        avatarUrl: true,
        country: true,
        city: true,
        bio: true,
      }
    });

    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
