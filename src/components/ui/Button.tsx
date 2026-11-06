import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'motion/react';
import { buttonMotionPresets } from '../../motion/variants';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'icon' | 'fab';
type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

const styles: Record<ButtonVariant, string> = {
  primary: 'motion-button-primary',
  accent: 'motion-button-accent',
  secondary: 'motion-button-secondary',
  ghost: 'motion-button-ghost',
  danger: 'motion-button-danger',
  icon: 'motion-button-icon',
  fab: 'motion-button-fab',
};

export function Button({ variant = 'primary', className = '', children, disabled, ...props }: Props) {
  const preset = buttonMotionPresets[variant];
  return (
    <motion.button
      {...props}
      disabled={disabled}
      whileHover={disabled ? undefined : preset.whileHover}
      whileTap={disabled ? undefined : preset.whileTap}
      className={`${styles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
