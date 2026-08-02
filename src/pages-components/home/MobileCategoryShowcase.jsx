"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getCategories } from "@/services/categoryService";
import styles from "./MobileCategoryShowcase.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

export default function MobileCategoryShowcase() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((res) =>
        setCategories((res.data || []).filter((cat) => !cat.is_reels)),
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !categories.length) return null;

  return (
    <section className={`section ${styles.wrap}`} aria-label="Categories">
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <h2 className={`section-title ${styles.title}`}>Shop by Category</h2>
          <p className="section-subtitle">
            One aisle at a time — pick the tools your kitchen needs
          </p>
        </div>

        <div className={styles.list}>
          {categories.map((cat, index) => {
            const imageLeft = index % 2 === 0;
            const href = `/shop?category=${cat.slug}`;
            const description =
              (cat.description || "").trim() ||
              `Explore our ${cat.name} collection for everyday cooking.`;

            return (
              <article
                key={cat.id}
                className={`${styles.card} ${imageLeft ? styles.imageLeft : styles.imageRight}`}
              >
                <div className={styles.media}>
                  {cat.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl(cat.image_url)}
                      alt={cat.name}
                      className={styles.image}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      {(cat.name || "?").charAt(0)}
                    </div>
                  )}
                </div>

                <div className={styles.smoke} aria-hidden="true" />

                <div className={styles.content}>
                  <h3 className={styles.name}>{cat.name}</h3>
                  <p className={styles.description}>{description}</p>
                  <Link href={href} className={`btn btn-primary ${styles.cta}`}>
                    Shop Now
                    <span aria-hidden="true"> →</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
