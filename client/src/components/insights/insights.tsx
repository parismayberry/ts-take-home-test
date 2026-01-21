import { Trash2Icon } from "lucide-react";
import { cx } from "../../lib/cx.ts";
import styles from "./insights.module.css";
import type { Insight } from "../../schemas/insight.ts";

type InsightsProps = {
  insights: Insight[];
  className?: string;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
};

export const Insights = ({
  insights,
  className,
  onDelete,
  isLoading,
}: InsightsProps) => {
  const renderContent = () => {
    if (isLoading) {
      return <p className={styles.loading}>Loading insights...</p>;
    }

    if (!insights?.length) {
      return <p>We have no insight!</p>;
    }

    return insights.map(({ id, text, createdAt, brand }) => (
      <div className={styles.insight} key={id}>
        <div className={styles["insight-meta"]}>
          <span>{brand}</span>
          <div className={styles["insight-meta-details"]}>
            <span>{createdAt.toLocaleDateString()}</span>
            <Trash2Icon
              className={styles["insight-delete"]}
              onClick={() =>
                onDelete?.(id)}
            />
          </div>
        </div>
        <p className={styles["insight-content"]}>{text}</p>
      </div>
    ));
  };

  return (
    <div className={cx(className)}>
      <h1 className={styles.heading}>Insights</h1>
      <div className={styles.list}>{renderContent()}</div>
    </div>
  );
};
