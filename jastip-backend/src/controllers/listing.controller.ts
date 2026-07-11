import { Request, Response } from 'express';
import prisma from '../prisma';

export const createListing = async (req: Request, res: Response) => {
  try {
    const { tripId, sellerId, productName, description, price, localCurrency, imageUrl, maxQuantity } = req.body;
    const listing = await prisma.listing.create({
      data: {
        tripId,
        sellerId,
        productName,
        description,
        price,
        localCurrency,
        imageUrl,
        maxQuantity
      }
    });
    res.status(201).json(listing);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getListings = async (req: Request, res: Response) => {
  try {
    const { followingOnly, followerId } = req.query;
    let whereClause: any = {};
    
    if (followingOnly === 'true' && followerId) {
      const follows = await prisma.follows.findMany({
        where: { followerId: followerId as string },
        select: { followingId: true }
      });
      const followingIds = follows.map(f => f.followingId);
      whereClause.sellerId = { in: followingIds };
    }

    const listings = await prisma.listing.findMany({ 
      where: whereClause, 
      include: { 
        seller: true,
        trip: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json(listings);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
