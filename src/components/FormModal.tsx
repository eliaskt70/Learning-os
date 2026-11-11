import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  children: ReactNode;
}

/** Form dialog built on native <dialog> for focus trapping, Esc handling and accessibility. */
export function FormModal({ title, open, onClose, onSubmit, submitLabel = 'حفظ', children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <form onSubmit={handleSubmit} className="modal-body">
          <header className="modal-header">
            <h2>{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="إغلاق">
              ✕
            </button>
          </header>
          <div className="modal-content">{children}</div>
          <footer className="modal-footer">
            <button type="submit" className="btn primary">
              {submitLabel}
            </button>
            <button type="button" className="btn" onClick={onClose}>
              إلغاء
            </button>
          </footer>
        </form>
      )}
    </dialog>
  );
}
