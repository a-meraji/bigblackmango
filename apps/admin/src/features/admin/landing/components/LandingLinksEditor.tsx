import { Trash2 } from 'lucide-react';
import Input from '@components/input/Input';
import IconButton from '@components/icon-button/IconButton';
import type { LandingLink } from '@t/landing';
import styles from './LandingEditorForm.module.css';

interface Props {
  label: string;
  links: LandingLink[];
  onChange: (links: LandingLink[]) => void;
  maxItems?: number;
}

export default function LandingLinksEditor({
  label,
  links,
  onChange,
  maxItems = 8,
}: Props) {
  function addLink() {
    if (links.length >= maxItems) return;
    onChange([...links, { label: '', href: '' }]);
  }

  function removeLink(index: number) {
    onChange(links.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: keyof LandingLink, value: string) {
    onChange(links.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }

  return (
    <div>
      <div className={styles.sectionHeader}>
        <span className={styles.subLabel}>{label}</span>
        <button
          type="button"
          className={styles.addBtn}
          onClick={addLink}
          disabled={links.length >= maxItems}
        >
          + افزودن لینک
        </button>
      </div>
      {links.length > 0 && (
        <div className={styles.linkList}>
          {links.map((link, index) => (
            <div key={index} className={styles.linkRow}>
              <Input
                label="برچسب"
                value={link.label}
                onChange={(e) => updateLink(index, 'label', e.target.value)}
              />
              <Input
                label="آدرس"
                value={link.href}
                onChange={(e) => updateLink(index, 'href', e.target.value)}
                placeholder="#section-id یا https://..."
                dir="ltr"
              />
              <IconButton
                icon={Trash2}
                label={`حذف لینک ${index + 1}`}
                variant="ghost"
                className={styles.linkRemoveBtn}
                onClick={() => removeLink(index)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
