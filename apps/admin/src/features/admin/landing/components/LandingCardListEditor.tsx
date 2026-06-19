import Input from '@components/input/Input';
import IconPicker from '@components/icon-picker/IconPicker';
import type { LandingCardItem } from '@t/landing';
import styles from './LandingEditorForm.module.css';

interface Props {
  label: string;
  items: LandingCardItem[];
  onChange: (items: LandingCardItem[]) => void;
  itemLabel?: string;
  maxItems?: number;
}

export default function LandingCardListEditor({
  label,
  items,
  onChange,
  itemLabel = 'کارت',
  maxItems = 6,
}: Props) {
  function addItem() {
    if (items.length >= maxItems) return;
    onChange([...items, { icon: null, title: '', body: '' }]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LandingCardItem, value: string | null) {
    onChange(
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className={styles.cardList}>
      <div className={styles.sectionHeader}>
        <span className={styles.subLabel}>{label}</span>
        <button
          type="button"
          className={styles.addBtn}
          onClick={addItem}
          disabled={items.length >= maxItems}
        >
          + افزودن
        </button>
      </div>

      {items.length === 0 && <p className={styles.hint}>موردی اضافه نشده است.</p>}

      {items.map((item, index) => (
        <div key={index} className={styles.statRow}>
          <div className={styles.rowActions}>
            <span className={styles.rowLabel}>
              {itemLabel} {index + 1}
            </span>
            <div className={styles.moveBtns}>
              <button type="button" className={styles.moveBtn} onClick={() => moveItem(index, -1)}>
                ↑
              </button>
              <button type="button" className={styles.moveBtn} onClick={() => moveItem(index, 1)}>
                ↓
              </button>
            </div>
          </div>
          <Input
            label="عنوان"
            value={item.title}
            onChange={(e) => updateItem(index, 'title', e.target.value)}
          />
          <Input
            label="متن"
            value={item.body}
            onChange={(e) => updateItem(index, 'body', e.target.value)}
          />
          <IconPicker
            value={item.icon ?? null}
            onChange={(icon) => updateItem(index, 'icon', icon)}
          />
          <button type="button" className={styles.removeBtn} onClick={() => removeItem(index)}>
            حذف
          </button>
        </div>
      ))}
    </div>
  );
}
