"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

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
  const [edges, setEdges] = useState({ start: true, end: true });
  const scrollRef = useRef(null);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [categories, loading, updateEdges]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const hasOverflow = !(edges.start && edges.end);

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
        </div>

        <div className={styles.rowWrap}>
          {hasOverflow ? (
            <>
              <button
                type="button"
                className={`${styles.navBtn} ${styles.navPrev}`}
                onClick={() => scroll(-1)}
                disabled={edges.start}
                aria-label="Previous categories"
              >
                <FiChevronLeft size={22} />
              </button>
              <button
                type="button"
                className={`${styles.navBtn} ${styles.navNext}`}
                onClick={() => scroll(1)}
                disabled={edges.end}
                aria-label="More categories"
              >
                <FiChevronRight size={22} />
              </button>
            </>
          ) : null}

          <div className={styles.row} ref={scrollRef}>
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
                        loading="lazy"
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
        </div>
      </div>
    </section>
  );
}
