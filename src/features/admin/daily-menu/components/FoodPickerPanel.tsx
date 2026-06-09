import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { adminGetFoods } from '@api/admin/foods';
import { adminGetCategories } from '@api/admin/categories';
import FoodPickerCard from './FoodPickerCard';
import Skeleton from '@components/skeleton/Skeleton';
import RawLocalizedInput from '@components/input/RawLocalizedInput';
import { formatNumber } from '@utils/locale';
import styles from './FoodPickerPanel.module.css';

const ALL = '__all__';

interface FoodPickerPanelProps {
  existingFoodIds: Set<string>;
  selectedIds: Set<string>;
  onToggle: (foodId: string) => void;
}

export default function FoodPickerPanel({
  existingFoodIds,
  selectedIds,
  onToggle,
}: FoodPickerPanelProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState(ALL);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories', 'picker'],
    queryFn: () => adminGetCategories({ isActive: true }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: foodsData, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'foods', 'picker', debouncedSearch, categoryId],
    queryFn: () =>
      adminGetFoods({
        isActive: true,
        limit: 100,
        search: debouncedSearch || undefined,
        categoryId: categoryId === ALL ? undefined : categoryId,
      }),
    placeholderData: (prev) => prev,
    staleTime: 2 * 60 * 1000,
  });

  const foods = foodsData?.items ?? [];

  return (
    <div className={styles.panel}>
      {/* Sticky controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <Search size={17} className={styles.searchIcon} aria-hidden="true" />
          <RawLocalizedInput
            type="search"
            placeholder="جستجوی نام غذا..."
            className={styles.searchInput}
            value={search}
            onChange={setSearch}
            aria-label="جستجوی غذا"
          />
          {search && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setSearch('')}
              aria-label="پاک کردن جستجو"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className={styles.chips} role="group" aria-label="فیلتر دسته‌بندی">
          <button
            type="button"
            className={categoryId === ALL ? styles.chipActive : styles.chip}
            onClick={() => setCategoryId(ALL)}
          >
            همه
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={categoryId === cat.id ? styles.chipActive : styles.chip}
              onClick={() => setCategoryId(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className={styles.results}>
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} height={160} borderRadius="var(--radius-lg)" />
            ))}
          </div>
        ) : foods.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔍</span>
            <p>غذایی پیدا نشد.</p>
            {debouncedSearch && (
              <p className={styles.emptyHint}>«{debouncedSearch}» در سیستم موجود نیست.</p>
            )}
          </div>
        ) : (
          <>
            {isFetching && !isLoading && <div className={styles.fetchingBar} aria-hidden="true" />}
            <div className={styles.resultsCount} aria-live="polite">
              {formatNumber(foods.length)} غذا
            </div>
            <div className={styles.grid}>
              {foods.map((food) => (
                <FoodPickerCard
                  key={food.id}
                  food={food}
                  isSelected={selectedIds.has(food.id)}
                  isInMenu={existingFoodIds.has(food.id)}
                  onToggle={() => onToggle(food.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
