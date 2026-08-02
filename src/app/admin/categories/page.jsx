"use client";

import { useEffect, useState } from "react";
import { FiFolder, FiGrid } from "react-icons/fi";

import {
  getAdminCategories,
  deleteCategory,
} from "@/services/adminService";
import CategoryModal from "@/pages-components/admin/CategoryModal/CategoryModal";
import ReelsCategoryPreview from "@/components/ReelsCategoryPreview/ReelsCategoryPreview";
import styles from "./categories.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAdminCategories();
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setModalOpen(true);
  };

  const handleDelete = async (cat) => {
    if (cat.is_reels || cat.slug === "reels") {
      alert("Reels category cannot be deleted. You can hide it instead.");
      return;
    }
    if (
      !confirm(
        `Delete "${cat.name}"? Products will be left without a category.`
      )
    ) {
      return;
    }
    setDeleting(cat.id);
    try {
      await deleteCategory(cat.id);
      fetchCategories();
    } catch (e) {
      alert(e?.response?.data?.detail || "Failed to delete category.");
    } finally {
      setDeleting(null);
    }
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    fetchCategories();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Categories</h2>
          <p className={styles.subtitle}>
            {categories.length} categories
          </p>
        </div>
        <button type="button" className={styles.addBtn} onClick={handleAdd}>
          + Add Category
        </button>
      </div>

      {loading ? (
        <div className={styles.loader}>
          <div className={styles.spinner} />
        </div>
      ) : categories.length === 0 ? (
        <div className={styles.empty}>
          <FiFolder size={48} className={styles.emptyIcon} aria-hidden />
          <p>No categories yet.</p>
          <button type="button" className={styles.addBtn} onClick={handleAdd}>
            Add First Category
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`${styles.card} ${!cat.is_active ? styles.inactive : ""}`}
            >
              <div className={styles.imageWrap}>
                {cat.is_reels || cat.slug === "reels" ? (
                  <ReelsCategoryPreview />
                ) : cat.image_url ? (
                  <img
                    src={mediaUrl(cat.image_url)}
                    alt={cat.name}
                    className={styles.catImage}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <FiGrid size={40} strokeWidth={1.75} aria-hidden />
                  </div>
                )}
                {!cat.is_active && (
                  <div className={styles.inactiveBadge}>Hidden</div>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <h3 className={styles.catName}>
                    {cat.name}
                    {(cat.is_reels || cat.slug === "reels") && (
                      <span className={styles.reelsTag}> Reels</span>
                    )}
                  </h3>
                  <span className={styles.productCount}>
                    {cat.is_reels || cat.slug === "reels"
                      ? "Video feed"
                      : `${cat.product_count || 0} products`}
                  </span>
                </div>

                {cat.description && (
                  <p className={styles.catDesc}>{cat.description}</p>
                )}

                <div className={styles.catMeta}>
                  <span className={styles.slugTag}>/{cat.slug}</span>
                  <span className={styles.posTag}>
                    {cat.product_count || 0} products
                  </span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => handleEdit(cat)}
                >
                  {cat.is_reels || cat.slug === "reels"
                    ? "Edit Details"
                    : "Edit Details"}
                </button>
                {!(cat.is_reels || cat.slug === "reels") && (
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(cat)}
                    disabled={deleting === cat.id}
                  >
                    {deleting === cat.id ? "…" : "Delete"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
