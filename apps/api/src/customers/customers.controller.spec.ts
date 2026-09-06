import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";

describe("CustomersController (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let orgId: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(MembershipGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");

    prisma = app.get(PrismaService);

    // إنشاء مستخدم
    const user = await prisma.user.create({
      data: {
        email: "test-integration@example.com",
        name: "Test User",
        password: "hashed-password",
      },
    });
    userId = user.id;

    // إنشاء منظمة
    const org = await prisma.organization.create({
      data: {
        name: "Test Org",
        slug: "test-org-" + Date.now(),
      },
    });
    orgId = org.id;

    // إنشاء عضوية
    await prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: userId,
        role: "OWNER",
      },
    });

    // Middleware لضبط المستخدم والعضوية
    app.use((req: any, _res: any, next: any) => {
      req.user = { id: userId, email: user.email, name: user.name };
      req.membership = {
        id: "test-member-id",
        organizationId: orgId,
        role: "OWNER",
      };
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    // تنظيف البيانات المنشأة (اختياري)
    await prisma.customer.deleteMany({ where: { organizationId: orgId } });
    await prisma.organizationMember.deleteMany({
      where: { organizationId: orgId },
    });
    await prisma.organization.delete({ where: { id: orgId } });
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  it("should create and list customers", async () => {
    const createResponse = await request(app.getHttpServer())
      .post("/api/customers")
      .set("x-organization-id", orgId)
      .send({
        name: "Test Customer",
        email: "customer@example.com",
      })
      .expect(201);

    expect(createResponse.body.name).toBe("Test Customer");

    const listResponse = await request(app.getHttpServer())
      .get("/api/customers")
      .set("x-organization-id", orgId)
      .expect(200);

    expect(listResponse.body.items).toHaveLength(1);
  }, 15000); // زيادة المهلة إلى 15 ثانية
});
