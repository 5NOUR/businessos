import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth-store";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { to: "/", label: t("common.dashboard") },
    { to: "/customers", label: t("common.customers") },
    { to: "/leads", label: t("common.leads") },
    { to: "/products", label: t("common.products") },
    { to: "/suppliers", label: t("common.suppliers") },
    { to: "/purchases", label: t("common.purchases") },
    { to: "/orders", label: t("common.orders") },
    { to: "/invoices", label: t("common.invoices") },
    { to: "/employees", label: t("common.employees") },
    { to: "/projects", label: t("common.projects") },
    { to: "/reports", label: t("common.reports") },
    { to: "/search", label: t("common.search") },
    { to: "/finance", label: t("common.finance") },
    { to: "/audit-logs", label: t("common.auditLogs") },
    { to: "/subscriptions", label: t("common.subscription") },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-gray-900">BusinessOS</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium",
                location.pathname === item.to
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="text-lg font-medium text-gray-700">BusinessOS</div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t("common.logout")}
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
