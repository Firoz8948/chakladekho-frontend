"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import styles from "./ShopCollectionBanner.module.css";

export default function ShopCollectionBanner() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.3, 0.6] },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="collection-banner-title"
    >
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={`container ${styles.content}`}>
        <p className={styles.eyebrow}>The ChaklaDekho Collection</p>
        <h2 id="collection-banner-title" className={styles.title}>
          Everything your kitchen needs, in one place
        </h2>
        <p className={styles.copy}>
          Discover thoughtfully selected tools made for everyday Indian cooking.
        </p>
        <div className={styles.videoFrame}>
          <video
            ref={videoRef}
            className={styles.video}
            src="/assets/videos/ctavideo.mp4"
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="ChaklaDekho kitchen collection"
          />
        </div>
        <Link href="/shop" className={styles.cta}>
          Explore All Products
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
