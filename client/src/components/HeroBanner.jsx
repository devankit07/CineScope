import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { HERO_VIDEOS } from '@/utils/constants';

const defaultHeroContent = {
  title: 'Discover. Watch. Remember.',
  description: 'Your next favorite story is here. Explore thousands of movies and pick up where you left off.',
  buttonText: 'Explore Movies',
  buttonLink: '/discover',
};

export default function HeroBanner({ heroContent: contentProp }) {
  const heroContent = { ...defaultHeroContent, ...contentProp };
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);

  const nextIndex = useCallback((i) => (i + 1) % Math.max(HERO_VIDEOS.length, 1), []);

  const handleVideoEnded = useCallback(() => {
    if (HERO_VIDEOS.length === 0) return;
    setCurrentVideoIndex((i) => nextIndex(i));
  }, [nextIndex]);

  const handleCanPlay = useCallback((e) => {
    e.target.play().catch(() => setVideoFailed(true));
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoFailed(true);
  }, []);

  const hasVideos = HERO_VIDEOS.length > 0 && !videoFailed;
  const src = HERO_VIDEOS[currentVideoIndex];

  return (
    <div className="relative h-[70vh] min-h-[400px] overflow-hidden">
      {hasVideos ? (
        <video
          key={currentVideoIndex}
          src={src}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop={false}
          playsInline
          autoPlay
          preload="auto"
          onCanPlay={handleCanPlay}
          onError={handleVideoError}
          onEnded={handleVideoEnded}
          style={{ pointerEvents: 'none' }}
        />
      ) : (
        <div className="absolute inset-0 bg-dark-800" />
      )}

      <div className="absolute inset-0 bg-gradient-cinema" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-10">
        <motion.div
          key="hero-content"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h1 className="font-sansation text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-lg">
            {heroContent.title}
          </h1>
          <p className="text-gray-300 text-base md:text-lg mb-6 line-clamp-3">
            {heroContent.description}
          </p>
          <Link
            to={heroContent.buttonLink}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-red hover:bg-red-600 transition-colors font-medium"
          >
            <Icon icon="mdi:play" className="w-5 h-5" />
            {heroContent.buttonText}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
