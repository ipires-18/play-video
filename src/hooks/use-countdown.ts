import { useState, useEffect, useRef } from 'react';

export interface UseCountdownProps {
  isActive: boolean;
  initialValue?: number;
  onComplete: () => void;
}

export interface UseCountdownReturn {
  countdownValue: number;
  setCountdownValue: (value: number) => void;
}

/**
 * Hook para gerenciar countdown
 */
export const useCountdown = ({
  isActive,
  initialValue = 5,
  onComplete,
}: UseCountdownProps): UseCountdownReturn => {
  const [countdownValue, setCountdownValue] = useState(initialValue);
  const onCompleteRef = useRef(onComplete);
  const hasStartedRef = useRef(false);

  // Atualizar ref do callback sempre que mudar
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Resetar countdown quando ficar ativo
  useEffect(() => {
    if (isActive) {
      setCountdownValue(initialValue);
      hasStartedRef.current = false;
    } else {
      hasStartedRef.current = false;
    }
  }, [isActive, initialValue]);

  useEffect(() => {
    if (!isActive || hasStartedRef.current) return;

    hasStartedRef.current = true;
    let interval: number;

    interval = window.setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          hasStartedRef.current = false;
          onCompleteRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      hasStartedRef.current = false;
    };
  }, [isActive]);

  return {
    countdownValue,
    setCountdownValue,
  };
};
