"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getCategories } from "@/services/categoryService";
import styles from "./CategorySidebar.module.css";

export default function CategorySidebar() {
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

  const selectCategory = (slug = "") => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/shop?${query}` : "/shop");
  };

  return (
    <div className={styles.sidebar} role="group" aria-label="Categories">
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>Categories</h3>
      </div>

      {loading ? (
        <div className={styles.skeletons}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={styles.skeleton} />
          ))}
        </div>
      ) : (
        <nav className={styles.catList}>
          <button
            type="button"
            className={`${styles.catItem} ${
              !activeCategory ? styles.catActive : ""
            }`}
            onClick={() => selectCategory()}
          >
            View All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`${styles.catItem} ${
                activeCategory === category.slug ? styles.catActive : ""
              }`}
              onClick={() => selectCategory(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
