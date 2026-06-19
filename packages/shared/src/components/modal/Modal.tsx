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
  /** Disables close button and Escape while true */
  preventClose?: boolean;
  /** When true, clicking the backdrop dismisses the modal (off by default for forms) */
  closeOnBackdropClick?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  dialogClassName,
  bodyClassName,
  preventClose = false,
  closeOnBackdropClick = false,
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

  useEffect(() => {
    if (!isOpen || preventClose) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, preventClose]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (!closeOnBackdropClick || preventClose) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleCancel(e: React.SyntheticEvent<HTMLDialogElement>) {
    e.preventDefault();
    if (!preventClose && closeOnBackdropClick) {
      onClose();
    }
  }

  /** Block native form navigation when a <form> inside the dialog submits */
  function handleDialogSubmit(e: React.SyntheticEvent<HTMLDialogElement>) {
    e.preventDefault();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.overlay}
      onCancel={handleCancel}
      onSubmit={handleDialogSubmit}
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
            <IconButton
              icon={X}
              label="بستن"
              variant="ghost"
              onClick={onClose}
              disabled={preventClose}
            />
          </div>
        )}
        <div className={clsx(styles.body, bodyClassName)}>{children}</div>
      </div>
    </dialog>
  );
}
