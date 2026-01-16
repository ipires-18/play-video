import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

/**
 * Componente de botão reutilizável
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className,
  children,
  ...props
}) => {
  const baseClasses =
    'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary:
      'bg-wkp-primary-dark text-white hover:bg-wkp-primary-darker focus:ring-wkp-primary-dark',
    secondary:
      'bg-wkp-gray-200 text-wkp-primary-dark hover:bg-wkp-gray-300 focus:ring-wkp-primary-dark',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};
