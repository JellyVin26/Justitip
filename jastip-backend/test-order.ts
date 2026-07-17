import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const listing = await prisma.listing.findFirst();
  if (!listing) {
    console.log("No listings found.");
    return;
  }
  
  const buyer = await prisma.user.findFirst({
    where: { id: { not: listing.sellerId } }
  });
  
  if (!buyer) {
    console.log("No buyer found.");
    return;
  }

  console.log("Creating order with:", {
    tripId: listing.tripId,
    buyerId: buyer.id,
    productName: listing.productName,
    estimatedPrice: listing.price,
    localCurrency: listing.localCurrency,
    quantity: 1,
    category: listing.category
  });

  try {
    const order = await prisma.order.create({
      data: {
        tripId: listing.tripId,
        buyerId: buyer.id,
        productName: listing.productName,
        quantity: 1,
        localCurrency: listing.localCurrency,
        category: listing.category,
        estimatedPrice: listing.price,
        history: {
          create: {
            status: 'REQUEST_SUBMITTED'
          }
        }
      }
    });
    console.log("Order created successfully:", order.id);
  } catch (error: any) {
    console.error("Failed to create order:", error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
