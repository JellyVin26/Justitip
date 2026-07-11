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
      whereClause.destinationCountry = country as string;
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

    const trips = await prisma.trip.findMany({ where: whereClause, include: { seller: true } });
    res.status(200).json(trips);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTripById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({ where: { id }, include: { seller: true } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.status(200).json(trip);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
