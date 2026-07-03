'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeTransition() {
  const { isTransitioning, transitionTheme } = useTheme();

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key="theme-transition"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          exit={{ x: '100%' }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="pointer-events-none fixed inset-0 z-[9999]"
          style={{
            background:
              transitionTheme === 'dark'
                ? 'linear-gradient(to right, #022c22 0%, #065f46 50%, #047857 100%)'
                : 'linear-gradient(to right, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
          }}
        />
      )}
    </AnimatePresence>
  );
}
