"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import ReelsCategoryPreview from "@/components/ReelsCategoryPreview/ReelsCategoryPreview";
import { getCategories } from "@/services/categoryService";
import styles from "./CategorySection.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className={`section ${styles.wrap}`}>
        <div className={`container ${styles.categoryContainer}`}>
          <h2 className={`section-title ${styles.headerTitle}`}>
            Explore Our Categories
          </h2>
          <p className="section-subtitle">
            Find the right kitchen essential for every recipe
          </p>
          <div className={styles.skeletonRow}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section className={`section ${styles.wrap}`}>
      <div className={`container ${styles.categoryContainer}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.headerText}>
            <h2 className={`section-title ${styles.headerTitle}`}>
              Explore Our Categories
            </h2>
            <p className="section-subtitle">
              Find the right kitchen essential for every recipe
            </p>
          </div>
          <div className={styles.scrollBtns}>
            <button
              type="button"
              className={styles.scrollBtn}
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
            >
              ‹
            </button>
            <button
              type="button"
              className={styles.scrollBtn}
              onClick={() => scroll(1)}
              aria-label="Scroll right"
            >
              ›
            </button>
          </div>
        </div>

        <div className={styles.desktopRow} ref={scrollRef}>
          {categories.map((cat) => {
            const isReels = !!cat.is_reels || cat.slug === "reels";
            return (
              <Link
                key={cat.id}
                href={isReels ? "/reels" : `/shop?category=${cat.slug}`}
                className={`${styles.catCard} ${isReels ? styles.reelsCard : ""}`}
              >
                <div className={styles.catImgWrap}>
                  {isReels ? (
                    <ReelsCategoryPreview />
                  ) : cat.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl(cat.image_url)}
                      alt={cat.name}
                      className={styles.catImg}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className={styles.catPlaceholder}>
                      {(cat.name || "?").charAt(0)}
                    </div>
                  )}
                  <span className={styles.catLabel}>
                    <span>{cat.name}</span>
                    <span className={styles.catArrow} aria-hidden="true">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className={styles.mobileList}>
          {categories.map((cat) => {
            const isReels = !!cat.is_reels || cat.slug === "reels";
            return (
              <Link
                key={cat.id}
                href={isReels ? "/reels" : `/shop?category=${cat.slug}`}
                className={styles.accItem}
              >
                <span className={styles.accName}>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
