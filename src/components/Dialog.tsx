'use client';

import { useEffect, useRef, type ReactNode } from 'react';

let openDialogs = 0;
let previousOverflow = '';

interface Props {
  children: ReactNode;
  onClose: () => void;
  label: string;
  className?: string;
}

export default function Dialog({ children, onClose, label, className = 'max-w-lg' }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const backdropPointer = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (openDialogs === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    openDialogs += 1;
    dialog.showModal();
    return () => {
      dialog.close();
      openDialogs -= 1;
      if (openDialogs === 0) document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className={'ui-dialog ' + className}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onPointerDown={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        backdropPointer.current = event.target === event.currentTarget && (
          event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom
        );
      }}
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (backdropPointer.current && outside && event.target === event.currentTarget) onClose();
        backdropPointer.current = false;
      }}
    >
      {children}
    </dialog>
  );
}
