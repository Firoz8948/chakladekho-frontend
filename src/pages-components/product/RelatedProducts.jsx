"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/components/ProductCard/ProductCard";
import { productService } from "@/services/productService";
import styles from "./RelatedProducts.module.css";

export default function RelatedProducts({ product }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!product) return;
    let active = true;
    const currentId = String(product.id);

    async function load() {
      try {
        const params = { page: 1, page_size: 8, sort: "newest" };
        if (product.category_slug) {
          params.category_slug = product.category_slug;
        } else if (product.category) {
          params.category = product.category;
        }

        const res = await productService.getProducts(params);
        const list = (res.items || []).filter(
          (p) => String(p.id) !== currentId
        );
        if (active) setProducts(list.slice(0, 4));
      } catch {
        if (active) setProducts([]);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [product]);

  if (!products.length) return null;

  return (
    <section className={styles.wrap}>
      <div className="container">
        <h2 className={styles.title}>You may also like</h2>
        <p className={styles.sub}>More picks from the same collection</p>
        <div className={styles.grid}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
