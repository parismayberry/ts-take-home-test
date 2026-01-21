import { useEffect, useState } from "react";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import styles from "./app.module.css";
import { Insight } from "../schemas/insight.ts";

export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setError(null);
      const res = await fetch(`/api/insights`);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch insights: ${res.status} ${res.statusText}`,
        );
      }

      const data = await res.json();
      const parsed = data.map((item: unknown) => Insight.parse(item));
      setInsights(parsed);
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : "An unexpected error occurred";
      setError(message);
      console.error("Error fetching insights:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsightAdded = () => {
    fetchInsights();
  };

  const handleInsightDeleted = async (id: number) => {
    try {
      setError(null);
      const res = await fetch(`/api/insights/${id}`, { method: "DELETE" });

      if (!res.ok && res.status !== 404) {
        throw new Error(
          `Failed to delete insight: ${res.status} ${res.statusText}`,
        );
      }

      if (res.status === 404) {
        setError("Insight not found. It may have already been deleted.");
      }

      await fetchInsights();
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : "Failed to delete insight";
      setError(message);
      console.error("Error deleting insight:", err);
    }
  };

  const dismissError = () => setError(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <main className={styles.main}>
      <Header onInsightAdded={handleInsightAdded} />
      {error && (
        <div className={styles.error}>
          <span>{error}</span>
          <button className={styles["error-dismiss"]} onClick={dismissError}>
            ✕
          </button>
        </div>
      )}
      <Insights
        className={styles.insights}
        insights={insights}
        onDelete={handleInsightDeleted}
        isLoading={isLoading}
      />
    </main>
  );
};
