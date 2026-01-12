import { useEffect, RefObject } from 'react';

export interface UseClickOutsideProps {
  isOpen: boolean;
  menuRef: RefObject<HTMLElement>;
  buttonRef: RefObject<HTMLElement>;
  onClose: () => void;
}

/**
 * Hook para fechar um menu ao clicar fora dele
 */
export const useClickOutside = ({
  isOpen,
  menuRef,
  buttonRef,
  onClose,
}: UseClickOutsideProps): void => {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(target) &&
        !buttonRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, menuRef, buttonRef, onClose]);
};
