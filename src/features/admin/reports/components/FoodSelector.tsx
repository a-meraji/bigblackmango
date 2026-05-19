import { useQuery } from '@tanstack/react-query';
import { adminGetFoods } from '@api/admin/foods';
import styles from './MetricSelector.module.css';

interface FoodSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

export default function FoodSelector({ value, onChange }: FoodSelectorProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'foods', 'reports-picker'],
    queryFn: () => adminGetFoods({ isActive: true, limit: 100, page: 1 }),
    staleTime: 60_000,
  });

  const foods = data?.items ?? [];

  return (
    <label className={styles.field}>
      <span className={styles.label}>غذا</span>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        aria-label="انتخاب غذا"
      >
        <option value="">انتخاب غذا...</option>
        {foods.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </label>
  );
}
