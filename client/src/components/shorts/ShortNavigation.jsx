import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function ShortNavigation() {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between h-14 px-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to="/"
        className="pointer-events-auto p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors text-white"
        aria-label="Back to home"
      >
        <Icon icon="mdi:arrow-left" className="w-6 h-6" />
      </Link>
      <span className="font-sansation font-bold text-white text-lg drop-shadow-md">Shorts</span>
      <div className="w-10" />
    </motion.header>
  );
}
