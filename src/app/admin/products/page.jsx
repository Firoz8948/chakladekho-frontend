"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiCopy, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  getAdminProducts,
  deleteProduct,
  duplicateProduct,
  getAdminCategories,
} from "@/services/adminService";
import { mediaUrl } from "@/utils/mediaUrl";
import styles from "./products.module.css";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [duplicating, setDuplicating] = useState(null);
  const router = useRouter();
  const LIMIT = 12;

  useEffect(() => {
    getAdminCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await getAdminProducts(params);
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch {
      alert("Failed to delete product.");
    } finally {
      setDeleting(null);
    }
  };

  const handleDuplicate = async (id, name) => {
    if (!confirm(`Duplicate "${name}"? A copy will be created as inactive.`)) {
      return;
    }
    setDuplicating(id);
    try {
      const res = await duplicateProduct(id);
      const copied = res.data;
      fetchProducts();
      if (copied?.id) {
        router.push(`/admin/products/edit/${copied.id}`);
      }
    } catch {
      alert("Failed to duplicate product.");
    } finally {
      setDuplicating(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Products</h2>
          <p className={styles.subtitle}>{total} products in catalog</p>
        </div>
        <Link href="/admin/products/add" className={styles.addBtn}>
          + Add Product
        </Link>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            width={16}
            height={16}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className={styles.catFilters}>
          <button
            type="button"
            className={`${styles.catBtn} ${!category ? styles.catActive : ""}`}
            onClick={() => {
              setCategory("");
              setPage(1);
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              className={`${styles.catBtn} ${category === cat.name ? styles.catActive : ""}`}
              onClick={() => {
                setCategory(cat.name);
                setPage(1);
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.loader}><div className={styles.spinner} /></div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🌰</div>
          <p>No products found.</p>
          <Link href="/admin/products/add" className={styles.addBtn}>Add First Product</Link>
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>MRP</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.productCell}>
                        <div className={styles.productThumb}>
                          {p.images?.[0] ? (
                            <img
                              src={mediaUrl(p.images[0])}
                              alt={p.name}
                              onError={(e) => { e.target.src = "/assets/placeholder.webp"; }}
                            />
                          ) : (
                            <span>🌰</span>
                          )}
                        </div>
                        <div>
                          <div className={styles.productName}>{p.name}</div>
                          <div className={styles.productSlug}>/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.catTag}>{p.category}</span></td>
                    <td className={styles.price}>₹{p.price?.toLocaleString("en-IN")}</td>
                    <td className={styles.mrp}>₹{p.mrp?.toLocaleString("en-IN")}</td>
                    <td>
                      <span className={`${styles.stock} ${p.stock === 0 ? styles.outOfStock : p.stock < 10 ? styles.lowStock : ""}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${p.is_active ? styles.active : styles.inactive}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {p.is_featured && <span className={styles.featuredBadge}>⭐ Yes</span>}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          href={`/admin/products/edit/${p.id}`}
                          className={styles.editBtn}
                          title="Edit"
                          aria-label={`Edit ${p.name}`}
                        >
                          <FiEdit2 size={14} aria-hidden />
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          className={styles.duplicateBtn}
                          onClick={() => handleDuplicate(p.id, p.name)}
                          disabled={duplicating === p.id}
                          title="Duplicate"
                          aria-label={`Duplicate ${p.name}`}
                        >
                          <FiCopy size={14} aria-hidden />
                          <span>
                            {duplicating === p.id ? "…" : "Duplicate"}
                          </span>
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleting === p.id}
                          title="Delete"
                          aria-label={`Delete ${p.name}`}
                        >
                          <FiTrash2 size={14} aria-hidden />
                          <span>{deleting === p.id ? "…" : "Delete"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
