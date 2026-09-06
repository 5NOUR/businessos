import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
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
