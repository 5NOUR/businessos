import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    // محاكاة localStorage لتوفير accessToken و currentOrgId
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "accessToken") return "test-token";
      if (key === "currentOrgId") return "test-org";
      return null;
    });
  });

  it("renders BusinessOS heading", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    // انتظر حتى تظهر اللوحة الجانبية
    const elements = await screen.findAllByText("BusinessOS");
    expect(elements.length).toBeGreaterThan(0);
  });
});
