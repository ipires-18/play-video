import React, { useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/use-click-outside';
import { cn } from '../../utils/cn';

export interface SpeedSelectorProps {
  playbackRate: number;
  onRateChange: (rate: number) => void;
  availableRates?: number[];
  className?: string;
}

/**
 * Componente de seletor de velocidade de reprodução
 */
export const SpeedSelector: React.FC<SpeedSelectorProps> = ({
  playbackRate,
  onRateChange,
  availableRates = [0.5, 0.75, 1, 1.25, 1.5, 2],
  className,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useClickOutside({
    isOpen: showMenu,
    menuRef,
    buttonRef,
    onClose: () => setShowMenu(false),
  });

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          'flex items-center space-x-1 px-2 py-1 bg-transparent hover:bg-transparent rounded text-xs font-semibold transition-colors text-wkp-primary-dark hover:text-wkp-primary-darker cursor-pointer',
          className
        )}
        style={{ cursor: 'pointer' }}
        aria-label="Velocidade de reprodução"
        aria-expanded={showMenu}
      >
        <span
          className={cn(
            'whitespace-nowrap tabular-nums text-sm font-normal',
            className
          )}
        >
          {playbackRate}x
        </span>
      </button>
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-xl p-1 flex flex-col min-w-[60px] z-20"
        >
          {availableRates.map((rate) => (
            <button
              key={rate}
              onClick={() => {
                onRateChange(rate);
                setShowMenu(false);
              }}
              className="px-3 py-1.5 text-xs text-left rounded hover:bg-slate-100 transition-colors cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              <span
                className={cn(
                  'whitespace-nowrap tabular-nums text-sm font-normal',
                  playbackRate === rate
                    ? 'text-wkp-primary-darker'
                    : 'text-wkp-primary-dark',
                  className
                )}
              >
                {rate}x
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
