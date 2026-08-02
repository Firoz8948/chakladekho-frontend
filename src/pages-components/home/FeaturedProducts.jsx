"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ProductCard from "@/components/ProductCard/ProductCard";
import { productService } from "@/services/productService";
import styles from "./FeaturedProducts.module.css";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    productService
      .getFeatured()
      .then((data) => active && setProducts(data || []))
      .catch(() => active && setProducts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className={`section ${styles.featuredSection}`}>
      <div className="container">
        <h2 className="section-title">Featured Products</h2>
        <p className="section-subtitle">Our most loved picks, just for you</p>

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`skeleton ${styles.skeletonCard}`} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted" style={{ textAlign: "center" }}>
            No featured products yet. Check back soon!
          </p>
        ) : (
          <div className={styles.grid}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className={styles.cta}>
          <Link href="/shop" className={styles.ctaBtn}>
            <span>View All Products</span>
            <span className={styles.ctaArrow} aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
