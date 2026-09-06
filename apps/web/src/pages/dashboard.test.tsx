import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DashboardPage } from "./dashboard";

// Mock hooks
vi.mock("@/hooks/use-dashboard", () => ({
  useDashboardSummary: () => ({
    isLoading: false,
    isError: false,
    data: {
      revenueThisMonth: 1000,
      expensesThisMonth: 500,
      profitThisMonth: 500,
      revenueThisYear: 10000,
      expensesThisYear: 5000,
      profitThisYear: 5000,
      ordersCount: 20,
      customersCount: 10,
      lowStockCount: 2,
      pendingTasksCount: 5,
    },
  }),
  useDashboardCharts: () => ({
    isLoading: false,
    isError: false,
    data: { labels: [], revenueData: [], expenseData: [] },
  }),
  useRecentActivities: () => ({
    isLoading: false,
    isError: false,
    data: [],
  }),
}));

// Mock localStorage
beforeEach(() => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
    if (key === "currentOrgId") return "test-org";
    return null;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DashboardPage", () => {
  it("renders revenue", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>,
    );
    const elements = screen.getAllByText(/Revenue/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
