// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../prisma';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tripId, buyerId, listingId, productName, productLink, productImageUrl, quantity, localCurrency, category, estimatedPrice } = req.body;
    
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (trip.sellerId === buyerId) {
      return res.status(403).json({ error: 'Sellers cannot order from their own trips' });
    }

    const orderQty = quantity || 1;

    if (listingId) {
      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      // Prevent duplicate orders from same buyer on same listing
      const existingOrder = await prisma.order.findFirst({
        where: {
          listingId,
          buyerId,
          status: { not: 'CANCELLED' }
        }
      });
      if (existingOrder) {
        return res.status(400).json({ error: 'You have already placed an order for this listing.' });
      }

      // Enforce maxQuantity if defined (> 0)
      if (listing.maxQuantity > 0) {
        const orderAggregation = await prisma.order.aggregate({
          where: {
            listingId,
            status: { not: 'CANCELLED' }
          },
          _sum: {
            quantity: true
          }
        });
        const currentTotal = orderAggregation._sum.quantity || 0;
        if (currentTotal + orderQty > listing.maxQuantity) {
          const remaining = Math.max(0, listing.maxQuantity - currentTotal);
          return res.status(400).json({ error: `Cannot order ${orderQty} item(s). Only ${remaining} remaining for this listing.` });
        }
      }
    }

    const order = await prisma.order.create({
      data: {
        tripId,
        buyerId,
        listingId: listingId || null,
        productName,
        productLink,
        productImageUrl,
        quantity: orderQty,
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

const FALLBACK_IDR_RATES: Record<string, number> = {
  IDR: 1,
  USD: 1 / 16000,
  EUR: 1 / 17500,
  GBP: 1 / 20000,
  JPY: 1 / 105,
  SGD: 1 / 12000,
  AUD: 1 / 10500,
  KRW: 1 / 12.5,
};

async function getConvertedAmountInPreferredCurrency(amountIdr: number, targetCurrency: string, orderExchangeRate?: number | null, localCurrency?: string | null): Promise<number> {
  if (!amountIdr) return 0;
  if (targetCurrency === 'IDR') return amountIdr;
  
  if (orderExchangeRate && localCurrency && targetCurrency === localCurrency && orderExchangeRate > 0) {
    return amountIdr / orderExchangeRate;
  }

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/IDR', { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      const rate = data.rates?.[targetCurrency];
      if (rate) return amountIdr * rate;
    }
  } catch (e) {
    // Fallback
  }

  const fallbackRate = FALLBACK_IDR_RATES[targetCurrency] || (1 / 16000);
  return amountIdr * fallbackRate;
}

export async function enrichOrderWithCurrencyConversion(order: any) {
  if (!order) return order;
  const buyerCurrency = order.buyer?.preferredCurrency || 'USD';
  
  let totalPricePreferredCurrency = null;
  if (order.totalPriceIdr) {
    totalPricePreferredCurrency = await getConvertedAmountInPreferredCurrency(
      order.totalPriceIdr,
      buyerCurrency,
      order.exchangeRate,
      order.localCurrency
    );
  }

  return {
    ...order,
    buyerPreferredCurrency: buyerCurrency,
    totalPricePreferredCurrency
  };
}

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

    const enrichedOrders = await Promise.all(orders.map(o => enrichOrderWithCurrencyConversion(o)));
    res.status(200).json(enrichedOrders);
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
        },
        review: true
      }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const enriched = await enrichOrderWithCurrencyConversion(order);
    res.status(200).json(enriched);
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
    
    if (status === 'CANCELLED') {
      const currentOrder = await prisma.order.findUnique({ where: { id } });
      if (!currentOrder) return res.status(404).json({ error: 'Order not found' });
      if (currentOrder.status !== 'REQUEST_SUBMITTED' && currentOrder.status !== 'TRIP_CONFIRMED') {
        return res.status(400).json({ error: 'Order cannot be cancelled once paid.' });
      }
    }

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
    const enriched = await enrichOrderWithCurrencyConversion(order);
    res.status(200).json(enriched);
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
    const enriched = await enrichOrderWithCurrencyConversion(order);
    res.status(200).json(enriched);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
