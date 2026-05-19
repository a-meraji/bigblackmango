import { useState } from 'react';
import styles from './TagInput.module.css';

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ label, tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('');

  function addTag(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.wrapper}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
            <button
              type="button"
              className={styles.remove}
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              aria-label={`حذف ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder="تگ وارد کنید و Enter بزنید"
          aria-label={label}
        />
      </div>
    </div>
  );
}
