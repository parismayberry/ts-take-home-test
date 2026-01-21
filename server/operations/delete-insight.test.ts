import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import { withDB } from "../testing.ts";
import deleteInsight from "./delete-insight.ts";

describe("deleting insights from the database", () => {
  describe("nothing in the DB", () => {
    withDB((fixture) => {
      let result: boolean;

      beforeAll(() => {
        result = deleteInsight({ db: fixture.db, id: 1 });
      });

      it("returns false when insight does not exist", () => {
        expect(result).toBe(false);
      });
    });
  });

  describe("populated DB - deleting existing insight", () => {
    withDB((fixture) => {
      let result: boolean;

      beforeAll(() => {
        fixture.insights.insert([
          {
            brand: 0,
            createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
            text: "1",
          },
          {
            brand: 1,
            createdAt: new Date("2026-01-02T00:00:00.000Z").toISOString(),
            text: "2",
          },
          {
            brand: 2,
            createdAt: new Date("2026-01-03T00:00:00.000Z").toISOString(),
            text: "3",
          },
        ]);
        result = deleteInsight({ db: fixture.db, id: 2 });
      });

      it("returns true when insight is deleted", () => {
        expect(result).toBe(true);
      });

      it("removes the insight from the database", () => {
        const rows = fixture.insights.selectAll();
        expect(rows.length).toBe(2);
      });

      it("removes only the specified insight", () => {
        const rows = fixture.insights.selectAll();
        const ids = rows.map((r) => r.id);
        expect(ids).not.toContain(2);
        expect(ids).toContain(1);
        expect(ids).toContain(3);
      });
    });
  });

  describe("populated DB - deleting non-existent insight", () => {
    withDB((fixture) => {
      let result: boolean;

      beforeAll(() => {
        fixture.insights.insert([
          {
            brand: 0,
            createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
            text: "1",
          },
        ]);
        result = deleteInsight({ db: fixture.db, id: 999 });
      });

      it("returns false when insight does not exist", () => {
        expect(result).toBe(false);
      });

      it("does not modify existing records", () => {
        const rows = fixture.insights.selectAll();
        expect(rows.length).toBe(1);
      });
    });
  });
});
