import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(callback, options = {}) {
  const { root = null, rootMargin = '200px', threshold = 0, enabled = true } = options;
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) callbackRef.current?.();
      },
      { root, rootMargin, threshold }
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [enabled, root, rootMargin, threshold]);

  return sentinelRef;
}
