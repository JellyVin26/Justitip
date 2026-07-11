import { Request, Response } from 'express';
import prisma from '../prisma';

export const createTrip = async (req: Request, res: Response) => {
  try {
    const { sellerId, destinationCountry, startDate, endDate, markupRules } = req.body;
    const trip = await prisma.trip.create({
      data: {
        sellerId,
        destinationCountry,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        markupRules
      }
    });
    res.status(201).json(trip);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTrips = async (req: Request, res: Response) => {
  try {
    const { country } = req.query;
    const whereClause = country ? { destinationCountry: country as string, status: 'UPCOMING' as any } : { status: 'UPCOMING' as any };
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
