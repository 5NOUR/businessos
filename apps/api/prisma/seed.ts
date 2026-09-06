import { PrismaClient, PlanName } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: PlanName.FREE,
      displayName: "Free",
      description: "Basic features for small teams",
      price: 0,
      maxUsers: 3,
      maxCustomers: 50,
      maxProducts: 100,
      maxOrders: 100,
    },
    {
      name: PlanName.PRO,
      displayName: "Pro",
      description: "Advanced features for growing businesses",
      price: 49,
      maxUsers: 10,
      maxCustomers: 500,
      maxProducts: 1000,
      maxOrders: 1000,
    },
    {
      name: PlanName.BUSINESS,
      displayName: "Business",
      description: "Full features for larger organizations",
      price: 99,
      maxUsers: 50,
      maxCustomers: 5000,
      maxProducts: 10000,
      maxOrders: 10000,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
