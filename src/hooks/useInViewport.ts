import { useEffect, useRef, useState, type RefObject } from "react";
import { motion } from "@/lib/motionConfig";

interface Options {
  /** Stop observing after the first intersection. */
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Single shared IntersectionObserver hook. Components must use this instead
 * of attaching their own observers so the page never runs dozens of them.
 */
export function useInViewport<T extends HTMLElement>(
  options: Options = {},
): [RefObject<T | null>, boolean] {
  const { once = true, threshold = motion.viewport.threshold, rootMargin = motion.viewport.rootMargin } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            if (once) io.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold, rootMargin]);

  return [ref, inView];
}
