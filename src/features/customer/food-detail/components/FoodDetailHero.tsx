import { useNavigate } from 'react-router-dom';
import { ArrowRight, Share2 } from 'lucide-react';
import type { PublicFoodDetail } from '@t/food';
import type { NormalizedAvailability } from '@utils/food-availability';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import IconButton from '@components/icon-button/IconButton';
import styles from './FoodDetailHero.module.css';

interface Props {
  food: PublicFoodDetail;
  availability: NormalizedAvailability | null;
}

export default function FoodDetailHero({ food, availability }: Props) {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: food.name, url: window.location.href }).catch(() => {});
    }
  }

  return (
    <div className={styles.hero}>
      {food.imageUrl ? (
        <img
          src={resolveMediaUrl(food.imageUrl)}
          alt={food.name}
          className={styles.image}
          fetchPriority="high"
        />
      ) : (
        <div className={styles.placeholder} aria-hidden="true" />
      )}

      {availability && !availability.isAvailable && (
        <div className={styles.soldOutOverlay} aria-label="تمام شد">
          <span>تمام شد</span>
        </div>
      )}

      <div className={styles.buttons}>
        <IconButton
          icon={ArrowRight}
          label="بازگشت"
          variant="secondary"
          className={styles.circleBtn}
          onClick={handleBack}
        />
        <IconButton
          icon={Share2}
          label="اشتراک‌گذاری"
          variant="secondary"
          className={styles.circleBtn}
          onClick={handleShare}
        />
      </div>
    </div>
  );
}
