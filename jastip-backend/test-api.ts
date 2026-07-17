
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  const listing = await prisma.listing.findFirst();
  if (!listing) return console.log("No listing found");

  let buyer = await prisma.user.findFirst({ where: { id: { not: listing.sellerId } } });
  
  if (!buyer) {
      buyer = await prisma.user.create({
          data: {
              name: 'Test Buyer',
              email: 'buyer' + Date.now() + '@test.com',
              passwordHash: 'hashed',
              role: 'BUYER'
          }
      });
  }

  const token = jwt.sign(
    { userId: buyer.id, email: buyer.email, role: buyer.role },
    process.env.JWT_SECRET || 'supersecretjwtkey',
    { expiresIn: '7d' }
  );

  console.log("Token generated, making API request...");

  try {
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        tripId: listing.tripId,
        buyerId: buyer.id,
        productName: listing.productName,
        estimatedPrice: listing.price,
        localCurrency: listing.localCurrency,
        quantity: 1,
        category: listing.category
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log("Success:", data.id);
    } else {
      console.error("Error:", data);
    }
  } catch (error: any) {
    console.error("Fetch Error:", error.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
