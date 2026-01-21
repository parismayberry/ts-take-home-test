import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AddInsight } from "./add-insight.tsx";

describe("AddInsight", () => {
  it("renders when open", () => {
    render(<AddInsight open onClose={() => undefined} />);
    expect(screen.getByText("Add a new insight")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(<AddInsight open={false} onClose={() => undefined} />);
    expect(screen.queryByText("Add a new insight")).toBeFalsy();
  });

  it("renders form elements", () => {
    render(<AddInsight open onClose={() => undefined} />);
    expect(screen.getByText("Brand")).toBeTruthy();
    expect(screen.getByText("Insight *")).toBeTruthy();
    expect(screen.getByPlaceholderText("Something insightful...")).toBeTruthy();
    expect(screen.getByText("Add insight")).toBeTruthy();
  });

  it("has submit button disabled when text is empty", () => {
    render(<AddInsight open onClose={() => undefined} />);
    const button = screen.getByRole("button", { name: "Add insight" });
    expect(button).toBeDisabled();
  });
});
