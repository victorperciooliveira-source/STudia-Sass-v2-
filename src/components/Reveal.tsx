import React from 'react';
import { motion } from 'motion/react';

interface RevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
  distance?: number;
  scale?: number;
}

export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  distance = 30,
  scale = 1,
}: RevealProps) {
  const getInitial = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance, scale };
      case 'down':
        return { opacity: 0, y: -distance, scale };
      case 'left':
        return { opacity: 0, x: distance, scale };
      case 'right':
        return { opacity: 0, x: -distance, scale };
      case 'none':
      default:
        return { opacity: 0, scale: scale !== 1 ? scale : 0.95 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
