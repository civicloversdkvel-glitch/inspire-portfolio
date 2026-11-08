import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'motion/react';
import { buttonMotionPresets } from '../../motion/variants';
import { LoaderCircle } from 'lucide-react';
import { DrawCheck } from '../../motion/components/DrawCheck';
import { useReducedMotion } from '../../motion/hooks/useReducedMotion';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'icon' | 'fab';
type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'onAnimationStart'> & {
  variant?: ButtonVariant;
  className?: string;
  loading?: boolean;
  success?: boolean;
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

export function Button({ variant = 'primary', className = '', children, disabled, loading = false, success = false, ...props }: Props) {
  const preset = buttonMotionPresets[variant];
  const reducedMotion = useReducedMotion();
  return (
    <motion.button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      whileHover={disabled || loading || reducedMotion ? undefined : preset.whileHover}
      whileTap={disabled || loading || reducedMotion ? undefined : preset.whileTap}
      className={`${styles[variant]} ${className}`}
    >
      {loading ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : success ? <DrawCheck size={17} /> : null}
      {children}
    </motion.button>
  );
}
