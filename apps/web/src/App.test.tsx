import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach } from "vitest";
import App from "./App";
import { useAuthStore } from "@/store/auth-store";

describe("App", () => {
  beforeEach(() => {
    // تعيين حالة المصادقة مباشرة لتجاوز صفحة تسجيل الدخول
    useAuthStore.setState({
      user: { id: "1", name: "Test User" },
      accessToken: "test-token",
      refreshToken: "test-refresh",
      currentOrgId: "test-org",
    });
  });

  it("renders BusinessOS heading", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    // انتظر ظهور أي عنصر يحتوي على "BusinessOS"
    const elements = await screen.findAllByText("BusinessOS");
    expect(elements.length).toBeGreaterThan(0);
  });
});
