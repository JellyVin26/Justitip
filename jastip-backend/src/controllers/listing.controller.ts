// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../prisma';

export const createListing = async (req: Request, res: Response) => {
  try {
    const { tripId, sellerId, productName, description, price, localCurrency, imageUrl, maxQuantity, category } = req.body;
    const listing = await prisma.listing.create({
      data: {
        tripId,
        sellerId,
        productName,
        description,
        price,
        localCurrency,
        category: category || 'Other',
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
    const { followingOnly, followerId, sellerId, tripId, category, search } = req.query;
    let whereClause: any = {};
    
    if (followingOnly === 'true' && followerId) {
      const follows = await prisma.follows.findMany({
        where: { followerId: followerId as string },
        select: { followingId: true }
      });
      const followingIds = follows.map(f => f.followingId);
      whereClause.sellerId = { in: followingIds };
    } else if (sellerId) {
      whereClause.sellerId = sellerId as string;
    }

    if (tripId) {
      whereClause.tripId = tripId as string;
    }

    if (category && category !== 'All Items' && category !== 'All') {
      whereClause.category = category as string;
    }

    if (search) {
      whereClause.productName = {
        contains: search as string,
        mode: 'insensitive'
      };
    }

    const listings = await prisma.listing.findMany({ 
      where: whereClause, 
      include: { 
        seller: {
          include: {
            sellerReviews: { select: { rating: true } }
          }
        },
        trip: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const listingsWithRating = listings.map(listing => {
      const reviews = listing.seller.sellerReviews;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : 0;
      
      // Clean up sellerReviews from the response
      const { sellerReviews, ...sellerData } = listing.seller;
      
      return {
        ...listing,
        seller: {
          ...sellerData,
          averageRating,
          reviewCount: reviews.length
        }
      };
    });

    res.status(200).json(listingsWithRating);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.listing.delete({
      where: { id }
    });
    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
