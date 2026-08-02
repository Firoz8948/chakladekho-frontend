"use client";

import styles from "./SortBar.module.css";

const OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
];

export default function SortBar({
  total,
  sort,
  onSortChange,
  variant = "default",
}) {
  return (
    <div
      className={`${styles.bar} ${
        variant === "sidebar" ? styles.sidebarBar : ""
      }`}
    >
      <span className={styles.count}>
        {total} {total === 1 ? "product" : "products"}
      </span>
      <label className={styles.sort}>
        Sort by:
        <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
