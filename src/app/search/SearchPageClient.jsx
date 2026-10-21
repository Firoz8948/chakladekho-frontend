"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

import { ProductGrid } from "@/pages-components/shop";
import { productService } from "@/services/productService";
import styles from "./search.module.css";

const DEBOUNCE_MS = 300;
const PAGE_SIZE = 20;

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState("");
  const inputRef = useRef(null);
  const requestRef = useRef(0);
  const timerRef = useRef(null);

  const runSearch = useCallback(
    async (value) => {
      const term = value.trim();
      const requestId = ++requestRef.current;

      // Keep the query in the URL so Back from a product restores the results
      window.history.replaceState(
        null,
        "",
        term ? `/search?q=${encodeURIComponent(term)}` : "/search",
      );

      if (!term) {
        setResults({ items: [], total: 0 });
        setSearched("");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await productService.getProducts({
          search: term,
          page: 1,
          page_size: PAGE_SIZE,
        });
        if (requestId !== requestRef.current) return;
        setResults({ items: data?.items || [], total: data?.total || 0 });
        setSearched(term);
      } catch {
        if (requestId !== requestRef.current) return;
        setResults({ items: [], total: 0 });
        setSearched(term);
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    inputRef.current?.focus();
    if (initialQuery) runSearch(initialQuery);
    // Run once on mount with the query from the URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { body, documentElement } = document;
    const prevBody = body.style.overflow;
    const prevHtml = documentElement.style.overflow;
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    return () => {
      body.style.overflow = prevBody;
      documentElement.style.overflow = prevHtml;
      clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runSearch(value), DEBOUNCE_MS);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(timerRef.current);
    inputRef.current?.blur();
    runSearch(query);
  };

  const handleClose = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const term = query.trim();
  const showResults = Boolean(term) && (loading || searched === term);

  return (
    <div className={styles.overlay} role="dialog" aria-label="Search products">
      <form className={styles.bar} onSubmit={handleSubmit} role="search">
        <div className={styles.field}>
          <FiSearch className={styles.fieldIcon} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="Search chakla, belan, khalbatta..."
            aria-label="Search products"
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>
        <button type="submit" className={styles.searchBtn}>
          Search
        </button>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close search"
        >
          <FiX size={22} />
        </button>
      </form>

      <div className={styles.body}>
        {!term ? (
          <p className={styles.hint}>Start typing to find products.</p>
        ) : showResults ? (
          <>
            {!loading && results.items.length > 0 ? (
              <p className={styles.count}>
                {results.total} result{results.total === 1 ? "" : "s"} for “{searched}”
              </p>
            ) : null}
            <ProductGrid products={results.items} loading={loading} />
            {!loading && results.total > results.items.length ? (
              <Link
                href={`/shop?q=${encodeURIComponent(searched)}`}
                className={styles.viewAll}
              >
                View all {results.total} results
              </Link>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
