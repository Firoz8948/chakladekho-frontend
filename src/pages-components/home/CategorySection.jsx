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
  const [pages, setPages] = useState({ count: 1, active: 0 });
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
    const maxScroll = el.scrollWidth - el.clientWidth;
    const atStart = el.scrollLeft <= 2;
    const atEnd = el.scrollLeft >= maxScroll - 2;
    setEdges({ start: atStart, end: atEnd });

    // One page = one viewport-width of cards; the last page may be partial.
    const count =
      maxScroll <= 2 ? 1 : Math.ceil((maxScroll - 2) / el.clientWidth) + 1;
    const active = atEnd
      ? count - 1
      : Math.min(count - 1, Math.round(el.scrollLeft / el.clientWidth));
    setPages((prev) =>
      prev.count === count && prev.active === active ? prev : { count, active },
    );
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
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const goToPage = (index) => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({
      left: Math.min(index * el.clientWidth, maxScroll),
      behavior: "smooth",
    });
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
                  </div>
                  <span className={styles.catName}>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {pages.count > 1 ? (
          <div className={styles.dots} role="tablist" aria-label="Category pages">
            {Array.from({ length: pages.count }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={pages.active === i}
                aria-label={`Show categories page ${i + 1} of ${pages.count}`}
                className={`${styles.dot} ${pages.active === i ? styles.dotActive : ""}`}
                onClick={() => goToPage(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
