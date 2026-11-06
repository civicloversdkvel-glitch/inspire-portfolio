import { motion } from 'motion/react';
import { drawPath } from '../variants';

export function DrawCheck({ size = 20, className = '' }: { size?: number; className?: string }) {
  return <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} initial="hidden" animate="visible" aria-hidden="true">
    <motion.path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" variants={drawPath} />
  </motion.svg>;
}
