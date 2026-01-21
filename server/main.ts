// deno-lint-ignore-file no-explicit-any
import { Database } from "@db/sqlite";
import * as oak from "@oak/oak";
import * as path from "@std/path";
import { z } from "zod";
import { Port } from "../lib/utils/index.ts";
import * as insightsTable from "$tables/insights.ts";
import listInsights from "./operations/list-insights.ts";
import lookupInsight from "./operations/lookup-insight.ts";
import createInsight from "./operations/create-insight.ts";
import deleteInsight from "./operations/delete-insight.ts";

console.log("Loading configuration");

const env = {
  port: Port.parse(Deno.env.get("SERVER_PORT")),
};

const dbFilePath = path.resolve("tmp", "db.sqlite3");

console.log(`Opening SQLite database at ${dbFilePath}`);

await Deno.mkdir(path.dirname(dbFilePath), { recursive: true });
const db = new Database(dbFilePath);
db.exec(insightsTable.createTable);

console.log("Initialising server");

// Input validation schemas
const CreateInsightSchema = z.object({
  brand: z.number().int().min(0, "Brand ID must be a non-negative integer"),
  text: z
    .string()
    .min(1, "Insight text is required")
    .max(1000, "Insight text must be 1000 characters or less"),
});

const IdParamSchema = z.coerce
  .number()
  .int()
  .min(0, "ID must be a non-negative integer");

const router = new oak.Router();

router.get("/_health", (ctx) => {
  ctx.response.body = "OK";
  ctx.response.status = 200;
});

router.get("/insights", (ctx) => {
  const result = listInsights({ db });
  ctx.response.body = result;
  ctx.response.status = 200;
});

router.get("/insights/:id", (ctx) => {
  const params = ctx.params as Record<string, any>;

  const idResult = IdParamSchema.safeParse(params.id);
  if (!idResult.success) {
    ctx.response.status = 400;
    ctx.response.body = {
      error: "Invalid ID parameter",
      details: idResult.error.flatten().formErrors,
    };
    return;
  }

  const result = lookupInsight({ db, id: idResult.data });

  if (!result) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Insight not found" };
    return;
  }

  ctx.response.body = result;
  ctx.response.status = 200;
});

router.post("/insights", async (ctx) => {
  let body: unknown;

  try {
    body = await ctx.request.body.json();
  } catch {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid JSON body" };
    return;
  }

  const parseResult = CreateInsightSchema.safeParse(body);

  if (!parseResult.success) {
    ctx.response.status = 400;
    ctx.response.body = {
      error: "Validation failed",
      details: parseResult.error.flatten().fieldErrors,
    };
    return;
  }

  const result = createInsight({
    db,
    brand: parseResult.data.brand,
    text: parseResult.data.text,
  });
  ctx.response.body = result;
  ctx.response.status = 201;
});

router.delete("/insights/:id", (ctx) => {
  const params = ctx.params as Record<string, any>;

  const idResult = IdParamSchema.safeParse(params.id);
  if (!idResult.success) {
    ctx.response.status = 400;
    ctx.response.body = {
      error: "Invalid ID parameter",
      details: idResult.error.flatten().formErrors,
    };
    return;
  }

  const deleted = deleteInsight({ db, id: idResult.data });

  if (deleted) {
    ctx.response.status = 204;
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Insight not found" };
  }
});

const app = new oak.Application();

// Global error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Unhandled error:", err);

    if (err instanceof oak.HttpError) {
      ctx.response.status = err.status;
      ctx.response.body = { error: err.message };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(env);
console.log(`Started server on port ${env.port}`);
