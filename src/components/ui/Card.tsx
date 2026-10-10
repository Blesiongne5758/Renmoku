import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  className = '',
  hover = true,
  onClick,
  padding = 'md',
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      onClick={onClick}
      className={`card-luxury ${paddingClasses[padding]} ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {children}
    </motion.div>
  );
}
