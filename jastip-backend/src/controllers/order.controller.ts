import { Request, Response } from 'express';
import prisma from '../prisma';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tripId, buyerId, productName, productLink, productImageUrl, quantity, localCurrency } = req.body;
    
    const order = await prisma.order.create({
      data: {
        tripId,
        buyerId,
        productName,
        productLink,
        productImageUrl,
        quantity: quantity || 1,
        localCurrency
      }
    });
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { buyerId, sellerId } = req.query;
    let whereClause = {};
    if (buyerId) {
      whereClause = { buyerId: buyerId as string };
    } else if (sellerId) {
      whereClause = { trip: { sellerId: sellerId as string } };
    }
    const orders = await prisma.order.findMany({ where: whereClause, include: { trip: true } });
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status Enum mapping in a real scenario
    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });
    res.status(200).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateOrderPricing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { originalPrice, exchangeRate, markupFee, shippingFee } = req.body;
    
    // In a real app, you would fetch the live exchange rate here.
    // For this prototype, we'll accept it from the body.
    
    const totalPriceIdr = (originalPrice * exchangeRate) + markupFee + (shippingFee || 0);

    const order = await prisma.order.update({
      where: { id },
      data: {
        originalPrice,
        exchangeRate,
        markupFee,
        shippingFee,
        totalPriceIdr
      }
    });
    res.status(200).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
