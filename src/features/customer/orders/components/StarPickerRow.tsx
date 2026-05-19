import { useState } from 'react';
import styles from './StarPickerRow.module.css';

interface Props {
  foodName: string;
  value: number;
  comment: string;
  onChange: (rating: number, comment: string) => void;
}

export default function StarPickerRow({ foodName, value, comment, onChange }: Props) {
  const [hover, setHover] = useState(0);

  return (
    <div className={styles.row}>
      <p className={styles.foodName}>{foodName}</p>
      <div className={styles.stars} aria-label={`امتیاز ${foodName}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${styles.star} ${(hover || value) >= star ? styles.lit : ''}`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star, comment)}
            aria-label={`${star.toLocaleString('fa-IR')} ستاره`}
          >
            ★
          </button>
        ))}
      </div>
      {value > 0 && (
        <textarea
          className={styles.comment}
          placeholder="نظر اختیاری..."
          value={comment}
          onChange={(e) => onChange(value, e.target.value)}
          rows={2}
          maxLength={500}
        />
      )}
    </div>
  );
}
