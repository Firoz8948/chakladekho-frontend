"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import ShopBrowse from "@/pages-components/shop/ShopBrowse";
import {
  CategorySidebar,
  ProductGrid,
  SortBar,
} from "@/pages-components/shop";
import { VideoProducts } from "@/pages-components/home";
import { productService } from "@/services/productService";
import { getCategoryBySlug } from "@/services/categoryService";
import styles from "./shop.module.css";

const PRODUCTS_PER_BATCH = 15;
const EMPTY_DATA = { items: [], total: 0, total_pages: 0 };

function ShopContent() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category") || "";
  const query = searchParams.get("q") || "";

  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [title, setTitle] = useState("All Products");
  const loadMoreMarkerRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function loadMeta() {
      if (query) {
        setTitle(`Search: "${query}"`);
        return;
      }
      if (categorySlug) {
        try {
          const res = await getCategoryBySlug(categorySlug);
          if (!active) return;
          setTitle(res.data.name);
        } catch {
          if (active) setTitle(categorySlug);
        }
        return;
      }
      setTitle("All Products");
    }

    loadMeta();
    return () => {
      active = false;
    };
  }, [categorySlug, query]);

  const fetchProductsPage = useCallback(
    (pageNumber) => {
      const params = {
        page: pageNumber,
        page_size: PRODUCTS_PER_BATCH,
        sort,
      };

      if (query) params.search = query;
      else if (categorySlug) params.category_slug = categorySlug;

      return productService.getProducts(params);
    },
    [categorySlug, query, sort],
  );

  useEffect(() => {
    let active = true;
    const requestVersion = ++requestVersionRef.current;

    loadingMoreRef.current = true;
    setLoading(true);
    setLoadingMore(false);
    setPage(1);
    setData(EMPTY_DATA);

    fetchProductsPage(1)
      .then((response) => {
        if (active && requestVersion === requestVersionRef.current) {
          setData(response);
        }
      })
      .catch(() => {
        if (active && requestVersion === requestVersionRef.current) {
          setData(EMPTY_DATA);
        }
      })
      .finally(() => {
        if (active && requestVersion === requestVersionRef.current) {
          loadingMoreRef.current = false;
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [fetchProductsPage]);

  const loadMoreProducts = useCallback(async () => {
    if (
      loading ||
      loadingMoreRef.current ||
      page >= data.total_pages
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);
    const requestVersion = requestVersionRef.current;
    const nextPage = page + 1;

    try {
      const response = await fetchProductsPage(nextPage);
      if (requestVersion !== requestVersionRef.current) return;

      setData((current) => ({
        ...response,
        items: [...current.items, ...response.items],
      }));
      setPage((current) => current + 1);
    } catch {
      // Keep the current products visible; the observer can retry on re-entry.
    } finally {
      if (requestVersion === requestVersionRef.current) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [data.total_pages, fetchProductsPage, loading, page]);

  useEffect(() => {
    const marker = loadMoreMarkerRef.current;
    if (!marker || loading || page >= data.total_pages) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreProducts();
      },
      {
        rootMargin: "0px 0px 280px",
        threshold: 0.01,
      },
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, [data.total_pages, loadMoreProducts, loading, page]);

  return (
    <>
      <div className={`container section ${styles.page} ${styles.shopContainer}`}>
        <div className={styles.headingRow}>
          <h1 className={styles.heading}>{title}</h1>
          <div className={styles.desktopSort}>
            <SortBar
              total={data.total}
              sort={sort}
              onSortChange={setSort}
              variant="inline"
            />
          </div>
        </div>

        <div className={styles.mobileBrowse}>
          {!query ? <ShopBrowse /> : null}
        </div>

        <div className={styles.shopLayout}>
          <aside className={styles.desktopSidebar} aria-label="Shop filters">
            <div className={styles.filterHeading}>
              <span>Refine your selection</span>
              <h2>Filters</h2>
            </div>
            <CategorySidebar />
          </aside>

          <main className={styles.productArea}>
            <div className={styles.mobileSort}>
              <SortBar
                total={data.total}
                sort={sort}
                onSortChange={setSort}
              />
            </div>

            <ProductGrid
              products={data.items}
              loading={loading}
              loadingMore={loadingMore}
            />

            <div
              ref={loadMoreMarkerRef}
              className={styles.loadMoreMarker}
              aria-live="polite"
            >
              {loadingMore ? <span>Loading more products...</span> : null}
              {!loading && data.items.length > 0 && page >= data.total_pages ? (
                <span>You have reached the end of the collection.</span>
              ) : null}
            </div>
          </main>
        </div>
      </div>

      <VideoProducts />
    </>
  );
}

export default function ShopPageClient() {
  return (
    <Suspense fallback={<div className="container section">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
