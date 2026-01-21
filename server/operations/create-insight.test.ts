import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import type { Insight } from "$models/insight.ts";
import { withDB } from "../testing.ts";
import createInsight from "./create-insight.ts";

describe("creating insights in the database", () => {
  describe("empty DB", () => {
    withDB((fixture) => {
      let result: Insight;

      beforeAll(() => {
        result = createInsight({
          db: fixture.db,
          brand: 1,
          text: "Test insight",
        });
      });

      it("returns the created insight", () => {
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.brand).toBe(1);
        expect(result.text).toBe("Test insight");
        expect(result.createdAt).toBeInstanceOf(Date);
      });

      it("persists the insight in the database", () => {
        const rows = fixture.insights.selectAll();
        expect(rows.length).toBe(1);
        expect(rows[0].brand).toBe(1);
        expect(rows[0].text).toBe("Test insight");
      });
    });
  });

  describe("populated DB", () => {
    withDB((fixture) => {
      let result: Insight;

      beforeAll(() => {
        fixture.insights.insert([
          {
            brand: 0,
            createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
            text: "Existing 1",
          },
          {
            brand: 1,
            createdAt: new Date("2026-01-02T00:00:00.000Z").toISOString(),
            text: "Existing 2",
          },
        ]);
        result = createInsight({
          db: fixture.db,
          brand: 2,
          text: "New insight",
        });
      });

      it("returns the newly created insight", () => {
        expect(result.brand).toBe(2);
        expect(result.text).toBe("New insight");
      });

      it("adds insight to existing records", () => {
        const rows = fixture.insights.selectAll();
        expect(rows.length).toBe(3);
      });
    });
  });
});
