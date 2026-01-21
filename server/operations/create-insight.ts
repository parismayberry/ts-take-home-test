import { Insight } from "$models/insight.ts";
import type { HasDBClient } from "../shared.ts";
import type * as insightsTable from "$tables/insights.ts";

type Input = HasDBClient & {
  brand: number;
  text: string;
};

export default (input: Input): Insight => {
  console.log(`Creating insight for brand=${input.brand}`);

  const createdAt = new Date().toISOString();

  input.db.exec(
    `INSERT INTO insights (brand, createdAt, text) VALUES (?, ?, ?)`,
    [input.brand, createdAt, input.text],
  );

  const [row] = input.db.sql<insightsTable.Row>`
    SELECT * FROM insights WHERE id = last_insert_rowid()
  `;

  const result = Insight.parse(row);

  console.log("Created insight:", result);
  return result;
};
