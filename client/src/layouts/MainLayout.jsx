import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="pt-16 pb-20 md:pb-0"
      >
        <Outlet />
      </motion.main>
      <BottomNav />
    </div>
  );
}
