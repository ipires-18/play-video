import React from 'react';
import Icons from '../icons';
import { cn } from '@foursales/components';

export interface BigPlayButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Componente de botão de play grande centralizado
 */
export const BigPlayButton: React.FC<BigPlayButtonProps> = ({
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={
        'absolute inset-0 flex items-center justify-center cursor-pointer z-10'
      }
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center transition-opacity hover:opacity-90 bg-wkp-primary-lighter/70',
          className
        )}
      >
        <Icons.Play
          className={cn(
            'w-10 h-10 text-wkp-primary-dark fill-wkp-primary-dark ml-1',
            className
          )}
        />
      </div>
    </div>
  );
};
