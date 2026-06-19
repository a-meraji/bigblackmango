import LandingEditorForm from '@features/admin/landing/components/LandingEditorForm';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>صفحه لندینگ</h1>
        <p className={styles.subtitle}>
          محتوای صفحه نصب اپ برای بازدیدکنندگان مرورگر
        </p>
      </header>
      <LandingEditorForm />
    </div>
  );
}
