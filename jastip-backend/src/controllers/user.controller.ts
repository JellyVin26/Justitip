// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../prisma';

export const followUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID of the user to follow
    const followerId = req.user?.id;

    if (!followerId) return res.status(401).json({ error: 'Unauthorized' });

    const existing = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id,
        }
      }
    });

    if (existing) {
      return res.status(200).json({ message: 'Already following', follow: existing });
    }

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
    const followerId = req.user?.id; 

    if (!followerId) return res.status(401).json({ error: 'Unauthorized' });

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

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    if (!followerId) return res.status(401).json({ error: 'Unauthorized' });

    const following = await prisma.follows.findMany({
      where: { followerId },
      select: { followingId: true }
    });

    res.status(200).json(following.map(f => f.followingId));
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
        preferredCurrency: true,
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
    const { name, phoneNumber, avatarUrl, country, city, bio, preferredCurrency } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        phoneNumber,
        avatarUrl,
        country,
        city,
        bio,
        preferredCurrency,
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
        preferredCurrency: true,
        createdAt: true,
      }
    });

    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
