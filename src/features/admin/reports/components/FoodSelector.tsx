import { useQuery } from '@tanstack/react-query';
import { adminGetFoods } from '@api/admin/foods';
import CustomSelect from '@components/custom-select/CustomSelect';
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
    <div className={styles.field}>
      <span className={styles.label}>غذا</span>
      <CustomSelect
        value={value}
        onChange={onChange}
        placeholder="انتخاب غذا..."
        aria-label="انتخاب غذا"
        size="sm"
        disabled={isLoading}
        options={[
          { value: '', label: 'انتخاب غذا...' },
          ...foods.map((f) => ({ value: f.id, label: f.name })),
        ]}
      />
    </div>
  );
}
