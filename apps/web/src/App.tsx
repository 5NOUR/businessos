import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import { AppShell } from "@/components/layouts/app-shell";

// Lazy load pages
const LoginPage = lazy(() =>
  import("@/pages/auth/login-page").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("@/pages/auth/register-page").then((m) => ({
    default: m.RegisterPage,
  })),
);
const CreateOrganizationPage = lazy(() =>
  import("@/pages/organizations/create-organization-page").then((m) => ({
    default: m.CreateOrganizationPage,
  })),
);
const DashboardPage = lazy(() =>
  import("@/pages/dashboard").then((m) => ({ default: m.DashboardPage })),
);
const CustomersPage = lazy(() =>
  import("@/pages/customers/customers-page").then((m) => ({
    default: m.CustomersPage,
  })),
);
const CustomerDetailPage = lazy(() =>
  import("@/pages/customers/customer-detail-page").then((m) => ({
    default: m.CustomerDetailPage,
  })),
);
const LeadsPage = lazy(() =>
  import("@/pages/leads/leads-page").then((m) => ({ default: m.LeadsPage })),
);
const ProductsPage = lazy(() =>
  import("@/pages/products/products-page").then((m) => ({
    default: m.ProductsPage,
  })),
);
const ProductDetailPage = lazy(() =>
  import("@/pages/products/product-detail-page").then((m) => ({
    default: m.ProductDetailPage,
  })),
);
const SuppliersPage = lazy(() =>
  import("@/pages/suppliers/suppliers-page").then((m) => ({
    default: m.SuppliersPage,
  })),
);
const PurchasesPage = lazy(() =>
  import("@/pages/purchases/purchases-page").then((m) => ({
    default: m.PurchasesPage,
  })),
);
const OrdersPage = lazy(() =>
  import("@/pages/orders/orders-page").then((m) => ({ default: m.OrdersPage })),
);
const OrderDetailPage = lazy(() =>
  import("@/pages/orders/order-detail-page").then((m) => ({
    default: m.OrderDetailPage,
  })),
);
const InvoicesPage = lazy(() =>
  import("@/pages/invoices/invoices-page").then((m) => ({
    default: m.InvoicesPage,
  })),
);
const InvoiceDetailPage = lazy(() =>
  import("@/pages/invoices/invoice-detail-page").then((m) => ({
    default: m.InvoiceDetailPage,
  })),
);
const EmployeesPage = lazy(() =>
  import("@/pages/employees/employees-page").then((m) => ({
    default: m.EmployeesPage,
  })),
);
const EmployeeDetailPage = lazy(() =>
  import("@/pages/employees/employee-detail-page").then((m) => ({
    default: m.EmployeeDetailPage,
  })),
);
const ProjectsPage = lazy(() =>
  import("@/pages/projects/projects-page").then((m) => ({
    default: m.ProjectsPage,
  })),
);
const ProjectDetailPage = lazy(() =>
  import("@/pages/projects/project-detail-page").then((m) => ({
    default: m.ProjectDetailPage,
  })),
);
const FinancePage = lazy(() =>
  import("@/pages/finance/finance-page").then((m) => ({
    default: m.FinancePage,
  })),
);
const ReportsPage = lazy(() =>
  import("@/pages/reports/reports-page").then((m) => ({
    default: m.ReportsPage,
  })),
);
const SearchPage = lazy(() =>
  import("@/pages/search/search-page").then((m) => ({ default: m.SearchPage })),
);
const AuditLogsPage = lazy(() =>
  import("@/pages/audit-logs/audit-logs-page").then((m) => ({
    default: m.AuditLogsPage,
  })),
);
const SubscriptionsPage = lazy(() =>
  import("@/pages/subscriptions/subscriptions-page").then((m) => ({
    default: m.SubscriptionsPage,
  })),
);

// مكوّن حماية المسارات
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="p-8 text-center text-gray-500">Loading...</div>
        }
      >
        <Routes>
          {/* المسارات العامة */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/create-organization"
            element={<CreateOrganizationPage />}
          />

          {/* المسارات المحمية */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell>
                  <DashboardPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <AppShell>
                  <CustomersPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute>
                <AppShell>
                  <CustomerDetailPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute>
                <AppShell>
                  <LeadsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <AppShell>
                  <ProductsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute>
                <AppShell>
                  <ProductDetailPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <AppShell>
                  <SuppliersPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <AppShell>
                  <PurchasesPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AppShell>
                  <OrdersPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <AppShell>
                  <OrderDetailPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <AppShell>
                  <InvoicesPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/:id"
            element={
              <ProtectedRoute>
                <AppShell>
                  <InvoiceDetailPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <AppShell>
                  <EmployeesPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/:id"
            element={
              <ProtectedRoute>
                <AppShell>
                  <EmployeeDetailPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <AppShell>
                  <ProjectsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <AppShell>
                  <ProjectDetailPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <AppShell>
                  <FinancePage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppShell>
                  <ReportsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <AppShell>
                  <SearchPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <AppShell>
                  <AuditLogsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <AppShell>
                  <SubscriptionsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* أي مسار غير معروف يوجه إلى الرئيسية */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
