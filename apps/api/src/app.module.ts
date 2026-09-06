import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { CustomersModule } from "./customers/customers.module";
import { LeadsModule } from "./leads/leads.module";
import { ProductsModule } from "./products/products.module";
import { InventoryModule } from "./inventory/inventory.module";
import { SuppliersModule } from "./suppliers/suppliers.module";
import { PurchasesModule } from "./purchases/purchases.module";
import { OrdersModule } from "./orders/orders.module";
import { InvoicesModule } from "./invoices/invoices.module";
import { PaymentsModule } from "./payments/payments.module";
import { IncomesModule } from "./incomes/incomes.module";
import { ExpensesModule } from "./expenses/expenses.module";
import { FinanceModule } from "./finance/finance.module";
import { EmployeesModule } from "./employees/employees.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { LeavesModule } from "./leaves/leaves.module";
import { ProjectsModule } from "./projects/projects.module";
import { TasksModule } from "./tasks/tasks.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ReportsModule } from "./reports/reports.module";
import { SearchModule } from "./search/search.module";
import { CurrencyModule } from "./currency/currency.module";
import { AuditLogsModule } from "./audit-logs/audit-logs.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { PlansModule } from "./plans/plans.module";
import { ThrottlerModule } from "@nestjs/throttler";
import { RedisModule } from "./redis/redis.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    OrganizationsModule,
    DashboardModule,
    CustomersModule,
    LeadsModule,
    ProductsModule,
    InventoryModule,
    SuppliersModule,
    PurchasesModule,
    OrdersModule,
    InvoicesModule,
    PaymentsModule,
    IncomesModule,
    ExpensesModule,
    FinanceModule,
    EmployeesModule,
    AttendanceModule,
    LeavesModule,
    ProjectsModule,
    TasksModule,
    NotificationsModule,
    ReportsModule,
    SearchModule,
    CurrencyModule,
    AuditLogsModule,
    PlansModule,
    SubscriptionsModule,
    RedisModule,
    HealthModule,
  ],
})
export class AppModule {}
