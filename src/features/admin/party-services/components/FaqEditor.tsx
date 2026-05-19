import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FaqItem } from '@types/party-service';
import styles from './FaqEditor.module.css';

interface FaqEditorProps {
  faq: FaqItem[];
  onChange: (faq: FaqItem[]) => void;
}

export default function FaqEditor({ faq, onChange }: FaqEditorProps) {
  function addItem() {
    onChange([...faq, { question: '', answer: '' }]);
  }

  function update(index: number, field: keyof FaqItem, value: string) {
    const next = [...faq];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }

  function remove(index: number) {
    onChange(faq.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= faq.length) return;
    const next = [...faq];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <span className={styles.label}>سوالات متداول</span>
        <button type="button" className={styles.addBtn} onClick={addItem}>
          + افزودن سوال
        </button>
      </div>

      {faq.length === 0 && <p className={styles.empty}>سوالی اضافه نشده است.</p>}

      {faq.map((item, index) => (
        <div key={index} className={styles.pair}>
          <div className={styles.reorder}>
            <button
              type="button"
              className={styles.moveBtn}
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label="جابجایی به بالا"
            >
              <ChevronUp size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.moveBtn}
              onClick={() => move(index, 1)}
              disabled={index === faq.length - 1}
              aria-label="جابجایی به پایین"
            >
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </div>
          <div className={styles.fields}>
            <textarea
              className={styles.input}
              placeholder="سوال"
              value={item.question}
              onChange={(e) => update(index, 'question', e.target.value)}
              rows={1}
            />
            <textarea
              className={styles.input}
              placeholder="پاسخ"
              value={item.answer}
              onChange={(e) => update(index, 'answer', e.target.value)}
              rows={2}
            />
          </div>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => remove(index)}
            aria-label="حذف سوال"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
