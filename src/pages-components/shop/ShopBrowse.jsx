"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getCategories } from "@/services/categoryService";
import styles from "./ShopBrowse.module.css";

export default function ShopBrowse() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const goToShop = (category = "") => {
    const params = new URLSearchParams();
    const query = searchParams.get("q");
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    const nextQuery = params.toString();
    router.push(nextQuery ? `/shop?${nextQuery}` : "/shop");
  };

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.catSkeleton} />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <nav className={styles.navDesktop} aria-label="Categories">
        <button
          type="button"
          className={`${styles.allBtn} ${
            !activeCategory ? styles.active : ""
          }`}
          onClick={() => goToShop()}
        >
          All
        </button>
        <div className={styles.catColumns}>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`${styles.catHead} ${
                activeCategory === category.slug ? styles.active : ""
              }`}
              onClick={() => goToShop(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </nav>

      <nav className={styles.navMobile} aria-label="Categories">
        <div className={styles.mobileCatRow}>
          <button
            type="button"
            className={`${styles.chip} ${styles.chipCat} ${
              !activeCategory ? styles.chipActive : ""
            }`}
            onClick={() => goToShop()}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`${styles.chip} ${styles.chipCat} ${
                activeCategory === category.slug ? styles.chipActive : ""
              }`}
              onClick={() => goToShop(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
