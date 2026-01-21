import { useEffect, useState } from "react";
import { BRANDS } from "../../lib/consts.ts";
import { Button } from "../button/button.tsx";
import { Modal, type ModalProps } from "../modal/modal.tsx";
import styles from "./add-insight.module.css";

type AddInsightProps = ModalProps & {
  onInsightAdded?: () => void;
};

export const AddInsight = ({ onInsightAdded, ...props }: AddInsightProps) => {
  const [brand, setBrand] = useState(BRANDS[0].id);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (props.open) {
      setText("");
      setBrand(BRANDS[0].id);
      setError(null);
    }
  }, [props.open]);

  const addInsight = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, text }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to add insight: ${res.status} ${res.statusText}`
        );
      }

      setText("");
      setBrand(BRANDS[0].id);
      onInsightAdded?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add insight";
      setError(message);
      console.error("Error adding insight:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (error) setError(null);
  };

  return (
    <Modal {...props}>
      <h1 className={styles.heading}>Add a new insight</h1>
      <form className={styles.form} onSubmit={addInsight}>
        {error && <div className={styles.error}>{error}</div>}
        <label className={styles.field}>
          Brand
          <select
            className={styles["field-input"]}
            value={brand}
            onChange={(e) => setBrand(Number(e.target.value))}
            disabled={isSubmitting}
          >
            {BRANDS.map(({ id, name }) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Insight *
          <textarea
            className={styles["field-input"]}
            rows={5}
            placeholder="Something insightful..."
            value={text}
            onChange={handleTextChange}
            disabled={isSubmitting}
          />
          <span className={styles["field-hint"]}>* Required</span>
        </label>
        <Button
          className={styles.submit}
          type="submit"
          label={isSubmitting ? "Adding..." : "Add insight"}
          disabled={!text.trim() || isSubmitting}
        />
      </form>
    </Modal>
  );
};
