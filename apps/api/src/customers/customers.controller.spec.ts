import { Test, TestingModule } from "@nestjs/testing";
import { CustomersController } from "./customers.controller";
import { CustomersService } from "./customers.service";
import { PrismaService } from "../prisma/prisma.service";

describe("CustomersController (unit)", () => {
  let controller: CustomersController;
  let service: CustomersService;

  beforeEach(async () => {
    const mockPrisma = {
      customer: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        deleteMany: jest.fn(),
      },
      auditLog: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should create a customer", async () => {
    const createSpy = jest.spyOn(service, "create").mockResolvedValue({
      id: "cust-1",
      name: "Test Customer",
    } as never);

    const result = await controller.create({ id: "user-1" } as never, "org-1", {
      name: "Test Customer",
    } as never);

    expect(result).toBeDefined();
    expect(createSpy).toHaveBeenCalled();
  });
});
