import React, { useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/use-click-outside';

export interface SpeedSelectorProps {
  playbackRate: number;
  onRateChange: (rate: number) => void;
  availableRates?: number[];
}

/**
 * Componente de seletor de velocidade de reprodução
 */
export const SpeedSelector: React.FC<SpeedSelectorProps> = ({
  playbackRate,
  onRateChange,
  availableRates = [0.5, 0.75, 1, 1.25, 1.5, 2],
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
        className="flex items-center space-x-1 px-2 py-1 bg-white/50 hover:bg-white/70 rounded text-xs font-semibold transition-colors text-slate-700"
        aria-label="Velocidade de reprodução"
        aria-expanded={showMenu}
      >
        <span>{playbackRate}x</span>
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
              className={`px-3 py-1.5 text-xs text-left rounded hover:bg-slate-100 transition-colors ${
                playbackRate === rate
                  ? 'text-indigo-600 font-semibold'
                  : 'text-slate-700'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
