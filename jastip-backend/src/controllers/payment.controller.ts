import { Request, Response } from 'express';
import prisma from '../prisma';

export const generateQR = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.totalPriceIdr) return res.status(400).json({ error: 'Order price not finalized' });

    // Mock Midtrans/Xendit QR Generation
    const mockQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=QRIS-MOCK-${order.id}`;

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amountIdr: order.totalPriceIdr,
        method: 'QRIS',
        qrImageUrl: mockQRUrl,
        status: 'PENDING',
        paymentId: `MOCK-${Date.now()}`
      }
    });

    res.status(201).json(payment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-payment-signature'];
    if (!process.env.PAYMENT_WEBHOOK_SECRET) {
      throw new Error('PAYMENT_WEBHOOK_SECRET is not set');
    }
    if (signature !== process.env.PAYMENT_WEBHOOK_SECRET) {
      return res.status(403).json({ error: 'Invalid webhook signature' });
    }

    const { paymentId, status } = req.body;
    
    // Update payment status (e.g. from Midtrans callback)
    const payment = await prisma.payment.findFirst({ where: { paymentId } });
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status }
      });
      // Also update order status if success
      if (status === 'SUCCESS') {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'PURCHASED' }
        });
      }
    }
    res.status(200).json({ message: 'Webhook received' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
