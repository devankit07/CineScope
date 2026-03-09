import { useRef } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

const LANGUAGES = [
  { id: 'hindi', label: 'हिन्दी', sub: 'Hindi', color: 'from-orange-500 to-amber-600' },
  { id: 'tamil', label: 'தமிழ்', sub: 'Tamil', color: 'from-amber-400 to-yellow-500' },
  { id: 'telugu', label: 'తెలుగు', sub: 'Telugu', color: 'from-emerald-500 to-green-600' },
  { id: 'malayalam', label: 'മലയാളം', sub: 'Malayalam', color: 'from-blue-500 to-indigo-600' },
  { id: 'kannada', label: 'ಕನ್ನಡ', sub: 'Kannada', color: 'from-rose-500 to-red-600' },
  { id: 'bengali', label: 'বাংলা', sub: 'Bengali', color: 'from-cyan-500 to-teal-600' },
  { id: 'marathi', label: 'मराठी', sub: 'Marathi', color: 'from-violet-500 to-purple-600' },
  { id: 'english', label: 'English', sub: 'English', color: 'from-slate-500 to-slate-700' },
];

export default function LanguageCarousel() {
  const trackRef = useRef(null);

  const items = [...LANGUAGES, ...LANGUAGES];

  return (
    <section className="px-4 sm:px-6 py-8 overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-1 h-8 rounded-full bg-accent-red" aria-hidden />
          <h2 className="font-sansation text-2xl md:text-3xl font-bold text-white">
            Explore In Your Language
          </h2>
        </div>
        <span className="text-white/60 shrink-0" aria-hidden>
          <Icon icon="mdi:chevron-right" className="w-8 h-8" />
        </span>
      </div>

      <div className="relative -mx-4 sm:-mx-6">
        <div className="overflow-hidden">
          <motion.div
            ref={trackRef}
            className="flex w-max gap-4 px-4 sm:px-6"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              x: {
                duration: 40,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
              },
            }}
          >
            {items.map((lang, index) => (
              <div
                key={`${lang.id}-${index}`}
                className={`flex-shrink-0 w-44 md:w-52 h-28 md:h-32 rounded-xl bg-gradient-to-br ${lang.color} flex flex-col items-center justify-center shadow-lg border border-white/10 overflow-hidden relative`}
              >
                <span className="font-bold text-white text-xl md:text-2xl drop-shadow-md text-center px-2">
                  {lang.label}
                </span>
                <span className="text-white/90 text-sm mt-0.5">{lang.sub}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
