import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = true, onClick }: CardProps) {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${hover ? 'hover:shadow-xl hover:scale-105' : ''} transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      whileHover={hover ? { scale: 1.05 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
