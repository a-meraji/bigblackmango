import { Share2 } from 'lucide-react';
import Modal from '@components/modal/Modal';
import { formatPrice } from '@utils/format-price';
import type { OrderReceipt } from '@api/orders';
import Button from '@components/button/Button';
import Icon from '@components/icon/Icon';
import styles from './ReceiptModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receipt: OrderReceipt;
}

export default function ReceiptModal({ isOpen, onClose, receipt }: Props) {
  function handleShare() {
    const text = `کد پیگیری سفارش: ${receipt.trackingCode}\nمبلغ: ${formatPrice(receipt.total)}\nآدرس: ${receipt.address}`;
    if (navigator.share) {
      void navigator.share({ title: 'رسید سفارش', text });
    } else {
      void navigator.clipboard.writeText(text);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="رسید سفارش">
      <div className={styles.wrapper}>
        <div className={styles.tracking}>
          <span className={styles.trackingLabel}>کد پیگیری</span>
          <span className={styles.trackingCode} dir="ltr">
            {receipt.trackingCode}
          </span>
        </div>

        <ul className={styles.items}>
          {receipt.items.map((item) => (
            <li key={item.id} className={styles.item}>
              <span>
                {item.foodName} × {item.quantity.toLocaleString('fa-IR')}
              </span>
              <span>{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className={styles.rows}>
          <div className={styles.row}>
            <span>جمع خرید</span>
            <span>{formatPrice(receipt.pricing.subtotal)}</span>
          </div>
          <div className={styles.row}>
            <span>هزینه ارسال</span>
            <span>{formatPrice(receipt.pricing.deliveryFee)}</span>
          </div>
        </div>

        <div className={styles.total}>
          <span>مبلغ کل</span>
          <span className={styles.totalAmount}>{formatPrice(receipt.total)}</span>
        </div>

        {receipt.address && receipt.address !== '—' && (
          <p className={styles.address}>{receipt.address}</p>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.shareBtn} onClick={handleShare}>
            <Icon icon={Share2} size="sm" decorative />
            اشتراک‌گذاری
          </button>
          <Button fullWidth onClick={onClose}>
            بستن
          </Button>
        </div>
      </div>
    </Modal>
  );
}
