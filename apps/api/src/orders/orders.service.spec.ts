import { Test, TestingModule } from "@nestjs/testing";
import { OrdersService } from "./orders.service";
import { PrismaService } from "../prisma/prisma.service";
import { BadRequestException } from "@nestjs/common";

describe("OrdersService", () => {
  let service: OrdersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      customer: { findFirst: jest.fn() },
      order: {
        findFirst: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      orderItem: { create: jest.fn() },
      inventoryMovement: { create: jest.fn() },
      product: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe("create", () => {
    it("should create order and not deduct stock when PENDING", async () => {
      const orgId = "org-1";
      const userId = "user-1";
      const dto = {
        customerId: "cust-1",
        items: [{ productId: "prod-1", quantity: 2, unitPrice: 100 }],
        discount: 0,
        tax: 0,
      };

      prisma.customer.findFirst.mockResolvedValue({ id: "cust-1" });
      prisma.product.findMany.mockResolvedValue([
        { id: "prod-1", name: "Test Product", currentStock: 10 },
      ]);
      prisma.order.findFirst.mockResolvedValue(null); // لا يوجد طلبات سابقة
      prisma.order.create.mockResolvedValue({
        id: "order-1",
        ...dto,
        orderNumber: "ORD-00001",
      });

      const result = await service.create(orgId, userId, dto as any);

      expect(prisma.order.create).toHaveBeenCalled();
      expect(prisma.inventoryMovement.create).not.toHaveBeenCalled(); // لا خصم للمخزون في الحالة الأولية
      expect(result.orderNumber).toBe("ORD-00001");
    });

    it("should throw BadRequestException if stock insufficient", async () => {
      const orgId = "org-1";
      const userId = "user-1";
      const dto = {
        customerId: "cust-1",
        items: [{ productId: "prod-1", quantity: 100, unitPrice: 100 }],
      };

      prisma.customer.findFirst.mockResolvedValue({ id: "cust-1" });
      prisma.product.findMany.mockResolvedValue([
        { id: "prod-1", name: "Test Product", currentStock: 5 },
      ]);

      await expect(service.create(orgId, userId, dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
