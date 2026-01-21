import type { HasDBClient } from "../shared.ts";

type Input = HasDBClient & {
  id: number;
};

export default (input: Input): boolean => {
  console.log(`Deleting insight with id=${input.id}`);

  input.db.exec(`DELETE FROM insights WHERE id = ?`, [input.id]);

  const changes = input.db.changes;
  const deleted = changes > 0;

  if (deleted) {
    console.log("Insight deleted successfully");
  } else {
    console.log("Insight not found");
  }

  return deleted;
};
