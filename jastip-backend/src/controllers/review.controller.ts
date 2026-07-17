import { Request, Response } from 'express';
import prisma from '../prisma';

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, rating, comment } = req.body;
    const buyerId = req.user.id;

    if (!orderId || !rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Invalid review data. Rating must be 1-5.' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { trip: true }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.buyerId !== buyerId) {
      res.status(403).json({ error: 'Only the buyer can review this order' });
      return;
    }

    // Accept completed or delivered or any later status if they have those
    if (order.status !== 'COMPLETED' && order.status !== 'DELIVERED') {
      res.status(400).json({ error: 'Can only review completed or delivered orders' });
      return;
    }

    const existingReview = await prisma.review.findUnique({
      where: { orderId: orderId }
    });

    if (existingReview) {
      res.status(400).json({ error: 'Review already exists for this order' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        buyerId,
        sellerId: order.trip.sellerId,
        rating,
        comment,
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};
