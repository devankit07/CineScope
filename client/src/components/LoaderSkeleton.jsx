import { motion } from 'framer-motion';

export default function LoaderSkeleton({ type = 'card' }) {
  if (type === 'detail') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-full md:w-80 flex-shrink-0 aspect-[2/3] rounded-xl bg-dark-600"
          />
          <div className="flex-1 space-y-4">
            <div className="h-10 w-3/4 bg-dark-600 rounded" />
            <div className="h-6 w-1/4 bg-dark-600 rounded" />
            <div className="h-4 w-full bg-dark-600 rounded" />
            <div className="h-4 w-full bg-dark-600 rounded" />
            <div className="h-4 w-2/3 bg-dark-600 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="rounded-xl overflow-hidden bg-dark-700"
    >
      <div className="aspect-[2/3] bg-dark-600" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-4/5 bg-dark-600 rounded" />
        <div className="h-3 w-1/3 bg-dark-600 rounded" />
      </div>
    </motion.div>
  );
}
