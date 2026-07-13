import { Request, Response } from 'express';
import prisma from '../prisma';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tripId, buyerId, productName, productLink, productImageUrl, quantity, localCurrency, category, estimatedPrice } = req.body;
    
    const order = await prisma.order.create({
      data: {
        tripId,
        buyerId,
        productName,
        productLink,
        productImageUrl,
        quantity: quantity || 1,
        localCurrency,
        category,
        estimatedPrice,
        history: {
          create: {
            status: 'REQUEST_SUBMITTED'
          }
        }
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
    const orders = await prisma.order.findMany({ 
      where: whereClause, 
      include: { trip: true, buyer: true } 
    });
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            seller: true
          }
        },
        buyer: true,
        history: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMessagesByOrderId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const messages = await prisma.message.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'asc' }
    });
    res.status(200).json(messages);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await prisma.order.update({
      where: { id },
      data: { 
        status,
        history: {
          create: {
            status
          }
        }
      },
      include: {
        trip: {
          include: {
            seller: true
          }
        },
        buyer: true,
        history: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    res.status(200).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateOrderPricing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { originalPrice, exchangeRate, markupFee, shippingFee, paymentQrUrl } = req.body;
    
    const totalPriceIdr = (originalPrice * exchangeRate) + markupFee + (shippingFee || 0);

    const order = await prisma.order.update({
      where: { id },
      data: {
        originalPrice,
        exchangeRate,
        markupFee,
        shippingFee,
        totalPriceIdr,
        paymentQrUrl
      },
      include: {
        trip: {
          include: {
            seller: true
          }
        },
        buyer: true,
        history: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    res.status(200).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
