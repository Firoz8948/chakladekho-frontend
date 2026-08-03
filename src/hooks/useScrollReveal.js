"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Adds a boolean once the element enters the viewport (scroll reveal).
 * Respects prefers-reduced-motion by revealing immediately.
 */
export default function useScrollReveal({
  threshold = 0.2,
  rootMargin = "0px 0px -8% 0px",
  once = true,
} = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        if (once) observer.unobserve(el);
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return [ref, visible];
}
