import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
};

interface AnimatedPageProps {
  children: React.ReactNode;
  pathname: string;
}

const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, pathname }) => {
  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{
        width: '100%',
        minHeight: '100%',
        background: '#12121F',
        willChange: 'transform, opacity',
        position: 'relative',
        zIndex: 1
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage; 