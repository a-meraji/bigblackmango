import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import IconButton from '@components/icon-button/IconButton';
import { useFocusTrap } from '@hooks/useFocusTrap';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Applied to the visible panel (not the full-screen dialog overlay) */
  dialogClassName?: string;
  bodyClassName?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  dialogClassName,
  bodyClassName,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, panelRef);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleNativeClose() {
      onClose();
    }

    dialog.addEventListener('close', handleNativeClose);

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      document.body.style.overflow = 'hidden';
    } else {
      if (dialog.open) {
        dialog.close();
      }
      document.body.style.overflow = '';
    }

    return () => {
      dialog.removeEventListener('close', handleNativeClose);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleCancel(e: React.SyntheticEvent<HTMLDialogElement>) {
    e.preventDefault();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.overlay}
      onCancel={handleCancel}
      onClick={handleOverlayClick}
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={panelRef}
        className={clsx(styles.panel, styles[size], dialogClassName)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={styles.header}>
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
            <IconButton icon={X} label="بستن" variant="ghost" onClick={onClose} />
          </div>
        )}
        <div className={clsx(styles.body, bodyClassName)}>{children}</div>
      </div>
    </dialog>
  );
}
