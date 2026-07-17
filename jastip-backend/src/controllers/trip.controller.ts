// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../prisma';

export const createTrip = async (req: Request, res: Response) => {
  try {
    const { sellerId, destinationCountry, startDate, endDate, markupRules, notes } = req.body;
    const trip = await prisma.trip.create({
      data: {
        sellerId,
        destinationCountry,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        markupRules,
        notes
      }
    });
    res.status(201).json(trip);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTrips = async (req: Request, res: Response) => {
  try {
    const { country, followingOnly, followerId, sellerId } = req.query;
    let whereClause: any = { status: 'UPCOMING' };
    
    if (country) {
      whereClause.destinationCountry = {
        contains: country as string,
        mode: 'insensitive'
      };
    }

    if (sellerId) {
      whereClause.sellerId = sellerId as string;
    }

    if (followingOnly === 'true' && followerId) {
      const follows = await prisma.follows.findMany({
        where: { followerId: followerId as string },
        select: { followingId: true }
      });
      const followingIds = follows.map(f => f.followingId);
      whereClause.sellerId = { in: followingIds };
    }

    const trips = await prisma.trip.findMany({ 
      where: whereClause, 
      include: { 
        seller: {
          include: {
            sellerReviews: { select: { rating: true } },
            trips: {
              include: { orders: { where: { status: 'COMPLETED' }, select: { id: true } } }
            }
          }
        } 
      } 
    });

    const tripsWithRating = trips.map(trip => {
      const reviews = trip.seller.sellerReviews || [];
      const averageRating = reviews.length > 0 
        ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length 
        : 0;
      
      const completedTripsCount = trip.seller.trips?.filter((t: any) => t.orders.length > 0).length || 0;
      
      const { sellerReviews, trips: sellerTrips, ...sellerData } = trip.seller;
      
      return {
        ...trip,
        seller: {
          ...sellerData,
          averageRating,
          reviewCount: reviews.length,
          completedTripsCount
        }
      };
    });

    res.status(200).json(tripsWithRating);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTripById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({ 
      where: { id }, 
      include: { 
        seller: {
          include: {
            sellerReviews: { select: { rating: true } },
            trips: {
              include: { orders: { where: { status: 'COMPLETED' }, select: { id: true } } }
            }
          }
        } 
      } 
    });
    
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    
    const reviews = trip.seller.sellerReviews || [];
    const averageRating = reviews.length > 0 
      ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length 
      : 0;
    
    const completedTripsCount = trip.seller.trips?.filter((t: any) => t.orders.length > 0).length || 0;
    
    const { sellerReviews, trips: sellerTrips, ...sellerData } = trip.seller;
    
    const tripWithRating = {
      ...trip,
      seller: {
        ...sellerData,
        averageRating,
        reviewCount: reviews.length,
        completedTripsCount
      }
    };
    
    res.status(200).json(tripWithRating);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
