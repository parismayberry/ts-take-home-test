import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Insights } from "./insights.tsx";
import type { Insight } from "../../schemas/insight.ts";

const TEST_INSIGHTS: Insight[] = [
  {
    id: 1,
    brand: 1,
    createdAt: new Date(),
    text: "Test insight",
  },
  { id: 2, brand: 2, createdAt: new Date(), text: "Another test insight" },
];

describe("insights", () => {
  it("renders insights", () => {
    const { getByText } = render(<Insights insights={TEST_INSIGHTS} />);
    expect(getByText(TEST_INSIGHTS[0].text)).toBeTruthy();
  });

  it("renders loading state", () => {
    render(<Insights insights={[]} isLoading={true} />);
    expect(screen.getByText("Loading insights...")).toBeTruthy();
  });

  it("renders empty state when no insights", () => {
    render(<Insights insights={[]} isLoading={false} />);
    expect(screen.getByText("We have no insight!")).toBeTruthy();
  });
});
