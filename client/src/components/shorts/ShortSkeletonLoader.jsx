import { motion } from 'framer-motion';

export default function ShortSkeletonLoader() {
  return (
    <div className="h-full w-full flex flex-col justify-end p-4 md:p-6 bg-dark-800">
      <div className="flex gap-4">
        <div className="flex-1 space-y-3">
          <motion.div
            className="h-8 w-3/4 rounded-lg bg-dark-600"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="h-4 w-1/2 rounded bg-dark-600"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-12 h-12 rounded-full bg-dark-600"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
