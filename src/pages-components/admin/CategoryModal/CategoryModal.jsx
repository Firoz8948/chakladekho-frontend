"use client";

import { useEffect, useRef, useState } from "react";

import ReelsCategoryPreview from "@/components/ReelsCategoryPreview/ReelsCategoryPreview";
import {
  createCategory,
  updateCategory,
  uploadCategoryImage,
} from "@/services/adminService";
import styles from "./CategoryModal.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function mediaUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

export default function CategoryModal({ category, onClose, onSuccess }) {
  const fileRef = useRef(null);
  const isEdit = Boolean(category);
  const isReels = Boolean(category?.is_reels || category?.slug === "reels");
  const [form, setForm] = useState({
    name: category?.name || "",
    description: category?.description || "",
    is_active: category?.is_active ?? true,
    position: category?.position ?? 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(
    category?.image_url ? mediaUrl(category.image_url) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError("");
  };

  const handleImagePick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        is_active: form.is_active,
        position: Number.parseInt(form.position, 10) || 0,
      };
      const response = isEdit
        ? await updateCategory(category.id, payload)
        : await createCategory(payload);
      let saved = response.data;

      if (imageFile && saved?.id && !isReels) {
        const body = new FormData();
        body.append("file", imageFile);
        saved = (await uploadCategoryImage(saved.id, body)).data;
      }

      onSuccess(saved);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.detail ||
          requestError?.message ||
          "Failed to save category",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <h2 id="category-modal-title" className={styles.modalTitle}>
              {isEdit ? "Edit Category" : "Add Category"}
            </h2>
            <p className={styles.modalSub}>
              Products are assigned directly to this category.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fields}>
            <label className={styles.field}>
              <span>Category name</span>
              <input
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                disabled={isReels}
                autoFocus
              />
            </label>

            <label className={styles.field}>
              <span>Description</span>
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
              />
            </label>

            <label className={styles.field}>
              <span>Display position</span>
              <input
                type="number"
                min="0"
                value={form.position}
                onChange={(event) => setField("position", event.target.value)}
              />
            </label>

            <label className={styles.activeField}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setField("is_active", event.target.checked)
                }
              />
              <span>Visible on the storefront</span>
            </label>
          </div>

          <div className={styles.mediaPanel}>
            <span className={styles.mediaLabel}>Category image</span>
            <div className={styles.preview}>
              {isReels ? (
                <ReelsCategoryPreview />
              ) : preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Category preview" />
              ) : (
                <span>No image selected</span>
              )}
            </div>
            {!isReels ? (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImagePick}
                />
                <button
                  type="button"
                  className={styles.imageBtn}
                  onClick={() => fileRef.current?.click()}
                >
                  Choose Image
                </button>
              </>
            ) : null}
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
