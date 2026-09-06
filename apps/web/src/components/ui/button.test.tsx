import { render, screen } from "@testing-library/react";
import { Button } from "./button";
import { describe, it, expect } from "vitest";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
