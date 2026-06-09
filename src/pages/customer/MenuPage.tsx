import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UtensilsCrossed, WifiOff } from 'lucide-react';
import PageShell from '@components/page-shell/PageShell';
import BackButton from '@components/back-button/BackButton';
import EmptyState from '@components/empty-state/EmptyState';
import Skeleton from '@components/skeleton/Skeleton';
import CategoryFilter from '@features/customer/home/components/CategoryFilter';
import FoodCard from '@features/customer/home/components/FoodCard';
import { useCategories } from '@features/customer/home/hooks/useCategories';
import { useMenuToday } from '@features/customer/home/hooks/useMenuToday';
import { useAddToCart } from '@features/customer/cart/hooks/useAddToCart';
import type { DailyMenuItem } from '@t/food';
import styles from './MenuPage.module.css';

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const initialCategoryId = useRef(searchParams.get('categoryId') ?? undefined);

  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(
    initialCategoryId.current,
  );

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: menu, isLoading: menuLoading, isError } = useMenuToday();
  const { addToCart, addingId } = useAddToCart();

  const chipBarRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const initialScrollDone = useRef(false);
  const programmaticScroll = useRef(false);

  const groupedItems = useMemo(() => {
    if (!menu?.items) return new Map<string, DailyMenuItem[]>();
    const map = new Map<string, DailyMenuItem[]>();
    for (const item of menu.items) {
      const catId = item.category.id;
      if (!map.has(catId)) map.set(catId, []);
      map.get(catId)!.push(item);
    }
    return map;
  }, [menu?.items]);

  const menuCategories = useMemo(
    () => categories.filter((cat) => groupedItems.has(cat.id)),
    [categories, groupedItems],
  );

  const setSectionRef = useCallback((el: HTMLElement | null, catId: string) => {
    if (el) {
      sectionRefs.current.set(catId, el);
    } else {
      sectionRefs.current.delete(catId);
    }
  }, []);

  // IntersectionObserver scroll-spy: update active chip as user scrolls
  useEffect(() => {
    if (!menuCategories.length) return;

    let observer: IntersectionObserver | null = null;

    const rafId = requestAnimationFrame(() => {
      const stickyBottom = chipBarRef.current?.getBoundingClientRect().bottom ?? 60;
      const rootMarginTop = Math.ceil(stickyBottom);
      const visibleIds = new Set<string>();

      observer = new IntersectionObserver(
        (entries) => {
          if (programmaticScroll.current) return;

          for (const entry of entries) {
            const id = entry.target.getAttribute('data-category-id');
            if (!id) continue;
            if (entry.isIntersecting) {
              visibleIds.add(id);
            } else {
              visibleIds.delete(id);
            }
          }

          const firstVisible = menuCategories.find((cat) => visibleIds.has(cat.id));
          if (firstVisible) {
            setActiveCategoryId(firstVisible.id);
          }
        },
        { rootMargin: `-${rootMarginTop}px 0px -50% 0px`, threshold: 0 },
      );

      for (const [id, el] of sectionRefs.current) {
        if (groupedItems.has(id)) observer.observe(el);
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [menuCategories, groupedItems]);

  const scrollToSection = useCallback((catId: string) => {
    const el = sectionRefs.current.get(catId);
    if (!el) return;

    const offset = (chipBarRef.current?.getBoundingClientRect().bottom ?? 60) + 8;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;

    programmaticScroll.current = true;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

    setTimeout(() => {
      programmaticScroll.current = false;
    }, 900);
  }, []);

  // Auto-scroll to initial category from URL ?categoryId= param (fires once)
  useEffect(() => {
    if (
      initialScrollDone.current ||
      !initialCategoryId.current ||
      !menuCategories.length ||
      menuLoading
    ) {
      return;
    }

    const rafId = requestAnimationFrame(() => {
      scrollToSection(initialCategoryId.current!);
      initialScrollDone.current = true;
    });

    return () => cancelAnimationFrame(rafId);
  }, [menuCategories, menuLoading, scrollToSection]);

  function handleChipSelect(id: string | undefined) {
    if (!id) return;
    setActiveCategoryId(id);
    scrollToSection(id);
  }

  const isLoading = categoriesLoading || menuLoading;

  if (isError) {
    return (
      <PageShell withCartInset narrow>
        <EmptyState
          icon={WifiOff}
          title="بارگذاری منو ناموفق بود"
          description="اتصال اینترنت را بررسی کنید و دوباره تلاش کنید."
          actionLabel="تلاش مجدد"
          onAction={() => window.location.reload()}
        />
      </PageShell>
    );
  }

  return (
    <>
      <div className={styles.backButtonWrap}>
        <BackButton to="/" />
      </div>

      <div ref={chipBarRef} className={styles.chipBar}>
        <CategoryFilter
          categories={menuCategories}
          activeId={activeCategoryId}
          onSelect={handleChipSelect}
          loading={isLoading}
          showAll={false}
        />
      </div>

      <PageShell withCartInset narrow className={styles.page}>
        {isLoading ? (
          <MenuSkeleton />
        ) : !menuCategories.length ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="منویی برای امروز وجود ندارد"
            description="فردا دوباره سر بزنید."
          />
        ) : (
          menuCategories.map((cat) => (
            <section
              key={cat.id}
              data-category-id={cat.id}
              ref={(el) => setSectionRef(el as HTMLElement | null, cat.id)}
              className={styles.section}
              aria-labelledby={`cat-heading-${cat.id}`}
            >
              <h2 id={`cat-heading-${cat.id}`} className={styles.sectionHeading}>
                {cat.name}
              </h2>
              <div className={styles.grid}>
                {(groupedItems.get(cat.id) ?? []).map((item) => (
                  <FoodCard
                    key={item.menuItemId}
                    item={item}
                    onAddToCart={addToCart}
                    addingId={addingId}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </PageShell>
    </>
  );
}

function MenuSkeleton() {
  return (
    <div className={styles.skeletonWrap} aria-busy="true" aria-label="در حال بارگذاری منو">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className={styles.skeletonCard} borderRadius="var(--radius-lg)" />
      ))}
    </div>
  );
}
