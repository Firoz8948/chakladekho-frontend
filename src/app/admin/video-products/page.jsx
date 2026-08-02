"use client";

import { useEffect, useRef, useState } from "react";
import {
  getAdminVideoProducts,
  createVideoProduct,
  updateVideoProduct,
  deleteVideoProduct,
  getProductsForMapping,
  getAdminProduct,
} from "@/services/adminService";
import styles from "./video-products.module.css";
import { mediaUrl } from "@/utils/mediaUrl";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  mrp: "",
  category: "",
  stock: "0",
  unit: "piece",
  position: "0",
  is_active: true,
  weight: "",
  length_cm: "",
  breadth_cm: "",
  height_cm: "",
};

export default function AdminVideoProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mode, setMode] = useState("scratch"); // scratch | attach
  const [attachedProductId, setAttachedProductId] = useState(null);
  const [attachedLabel, setAttachedLabel] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileRef = useRef();
  const imagesRef = useRef();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getAdminVideoProducts();
      setItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    getProductsForMapping()
      .then((res) => setProductOptions(res.data || []))
      .catch(() => setProductOptions([]));
  }, [modalOpen]);

  const resetAttach = () => {
    setAttachedProductId(null);
    setAttachedLabel("");
    setProductSearch("");
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setMode("scratch");
    resetAttach();
    setVideoFile(null);
    setVideoPreview(null);
    setImageFiles([]);
    setExistingImages([]);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      mrp: String(item.mrp),
      category: item.category,
      stock: String(item.stock),
      unit: item.unit || "piece",
      position: String(item.position),
      is_active: item.is_active,
      weight: item.weight != null ? String(item.weight) : "",
      length_cm: item.length_cm != null ? String(item.length_cm) : "",
      breadth_cm: item.breadth_cm != null ? String(item.breadth_cm) : "",
      height_cm: item.height_cm != null ? String(item.height_cm) : "",
    });
    if (item.product_id) {
      setMode("attach");
      setAttachedProductId(item.product_id);
      setAttachedLabel(item.name);
    } else {
      setMode("scratch");
      resetAttach();
    }
    setVideoFile(null);
    setVideoPreview(item.video_url ? mediaUrl(item.video_url, API_BASE) : null);
    setImageFiles([]);
    setExistingImages(Array.isArray(item.images) ? item.images : []);
    setModalOpen(true);
  };

  const applyAttachedProduct = async (productId) => {
    try {
      const res = await getAdminProduct(productId);
      const p = res.data;
      setAttachedProductId(p.id);
      setAttachedLabel(p.name);
      setForm((prev) => ({
        ...prev,
        name: p.name || "",
        description: p.description || "",
        price: String(p.price ?? ""),
        mrp: String(p.mrp ?? p.price ?? ""),
        category: p.category || prev.category || "Reels",
        stock: String(p.stock ?? 0),
        unit: p.unit || "piece",
        weight: p.weight != null ? String(p.weight) : "",
        length_cm: p.length_cm != null ? String(p.length_cm) : "",
        breadth_cm: p.breadth_cm != null ? String(p.breadth_cm) : "",
        height_cm: p.height_cm != null ? String(p.height_cm) : "",
      }));
      setExistingImages(Array.isArray(p.images) ? p.images : []);
      setImageFiles([]);
      setMode("attach");
    } catch {
      alert("Failed to load product details.");
    }
  };

  const handleVideoFile = (file) => {
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "attach" && !attachedProductId) {
      alert("Select a product to attach, or switch to Create from scratch.");
      return;
    }
    if (!form.name.trim() || !form.price || !form.mrp || !form.category.trim()) {
      alert("Name, price, MRP and category are required.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price", form.price);
      fd.append("mrp", form.mrp);
      fd.append("category", form.category.trim());
      fd.append("stock", form.stock);
      fd.append("unit", form.unit);
      fd.append("position", form.position);
      fd.append("is_active", form.is_active);
      if (form.weight !== "") fd.append("weight", form.weight);
      if (form.length_cm !== "") fd.append("length_cm", form.length_cm);
      if (form.breadth_cm !== "") fd.append("breadth_cm", form.breadth_cm);
      if (form.height_cm !== "") fd.append("height_cm", form.height_cm);

      if (mode === "attach" && attachedProductId) {
        fd.append("product_id", String(attachedProductId));
        // Images come from the attached product live — don't overwrite with empties
        fd.append("images_json", JSON.stringify([]));
      } else {
        if (editing) fd.append("clear_attached", "true");
        fd.append("images_json", JSON.stringify(existingImages));
        imageFiles.forEach((f) => fd.append("images", f));
      }

      if (videoFile) fd.append("video", videoFile);

      if (editing) {
        await updateVideoProduct(editing.id, fd);
      } else {
        await createVideoProduct(fd);
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setDeleting(item.id);
    try {
      await deleteVideoProduct(item.id);
      fetchItems();
    } catch {
      alert("Failed to delete.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Video Products</h2>
          <p className={styles.subtitle}>{items.length} video products</p>
        </div>
        <button type="button" className={styles.addBtn} onClick={openAdd}>
          + Add Video Product
        </button>
      </div>

      {loading ? (
        <div className={styles.loader}><div className={styles.spinner} /></div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <span>🎬</span>
          <p>No video products yet.</p>
          <button type="button" className={styles.addBtn} onClick={openAdd}>
            Add First Video Product
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={`${styles.card} ${!item.is_active ? styles.inactive : ""}`}>
              <div className={styles.videoWrap}>
                {item.video_url ? (
                  <video
                    src={mediaUrl(item.video_url, API_BASE)}
                    className={styles.video}
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                  />
                ) : (
                  <div className={styles.noVideo}>🎬 No video</div>
                )}
                {!item.is_active && <div className={styles.inactiveBadge}>Hidden</div>}
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <span className={styles.itemCategory}>
                  {item.category}
                  {item.product_id ? " · Attached" : ""}
                </span>
                <div className={styles.itemPrices}>
                  <span className={styles.itemPrice}>₹{item.price.toLocaleString("en-IN")}</span>
                  {item.mrp > item.price && (
                    <span className={styles.itemMrp}>₹{item.mrp.toLocaleString("en-IN")}</span>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <button type="button" className={styles.editBtn} onClick={() => openEdit(item)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(item)}
                    disabled={deleting === item.id}
                  >
                    {deleting === item.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editing ? `Edit — ${editing.name}` : "New Video Product"}
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.modeRow}>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${mode === "scratch" ? styles.modeBtnActive : ""}`}
                  onClick={() => {
                    setMode("scratch");
                    resetAttach();
                  }}
                >
                  Create from scratch
                </button>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${mode === "attach" ? styles.modeBtnActive : ""}`}
                  onClick={() => setMode("attach")}
                >
                  Attach a product
                </button>
              </div>

              {mode === "attach" && (
                <div className={styles.attachBox}>
                  <label className={styles.label}>Search & attach product</label>
                  <input
                    className={styles.input}
                    placeholder="Type product name…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  {attachedProductId ? (
                    <div className={styles.attachedChip}>
                      <span>
                        Attached: <strong>{attachedLabel}</strong> (#{attachedProductId})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          resetAttach();
                          setExistingImages([]);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className={styles.productPickList}>
                      {productOptions
                        .filter((p) =>
                          p.name
                            .toLowerCase()
                            .includes(productSearch.trim().toLowerCase())
                        )
                        .slice(0, 8)
                        .map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className={styles.productPickItem}
                            onClick={() => applyAttachedProduct(p.id)}
                          >
                            {p.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={mediaUrl(p.image, API_BASE)} alt="" />
                            ) : (
                              <span className={styles.pickPlaceholder}>—</span>
                            )}
                            <span>
                              {p.name}
                              <em>{p.category || ""}</em>
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                  <p className={styles.attachHint}>
                    Preview uses this product&apos;s images, price and details.
                    You still upload the reel video on the right.
                  </p>
                </div>
              )}

              <div className={styles.formGrid}>
                {/* Left — fields */}
                <div className={styles.formLeft}>
                  <div className={styles.field}>
                    <label className={styles.label}>Product Name *</label>
                    <input
                      className={styles.input}
                      placeholder="e.g. Wooden Chakla 10 inch"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      required
                      readOnly={mode === "attach" && !!attachedProductId}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Description</label>
                    <textarea
                      className={styles.textarea}
                      rows={3}
                      placeholder="Short description…"
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label className={styles.label}>Price (₹) *</label>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={form.price}
                        onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>MRP (₹) *</label>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={form.mrp}
                        onChange={(e) => setForm((p) => ({ ...p, mrp: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label className={styles.label}>Category *</label>
                      <input
                        className={styles.input}
                        placeholder="Chakla"
                        value={form.category}
                        onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Stock</label>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label className={styles.label}>Unit</label>
                      <input
                        className={styles.input}
                        placeholder="piece"
                        value={form.unit}
                        onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Display Order</label>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        value={form.position}
                        onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label className={styles.label}>Weight (g)</label>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        value={form.weight}
                        onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>L × B × H (cm)</label>
                      <div className={styles.dims}>
                        <input
                          className={styles.input}
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="L"
                          value={form.length_cm}
                          onChange={(e) => setForm((p) => ({ ...p, length_cm: e.target.value }))}
                        />
                        <input
                          className={styles.input}
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="B"
                          value={form.breadth_cm}
                          onChange={(e) => setForm((p) => ({ ...p, breadth_cm: e.target.value }))}
                        />
                        <input
                          className={styles.input}
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="H"
                          value={form.height_cm}
                          onChange={(e) => setForm((p) => ({ ...p, height_cm: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      {mode === "attach" ? "Product Images (from attached product)" : "Product Images"}
                    </label>
                    {mode === "attach" ? (
                      <div className={styles.imageRow}>
                        {existingImages.length === 0 ? (
                          <span className={styles.attachHint}>No images on attached product</span>
                        ) : (
                          existingImages.map((url) => (
                            <div key={url} className={styles.thumbWrap}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={mediaUrl(url, API_BASE)} alt="" />
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <>
                        <input
                          ref={imagesRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            setImageFiles(Array.from(e.target.files || []))
                          }
                        />
                        <div className={styles.imageRow}>
                          {existingImages.map((url) => (
                            <div key={url} className={styles.thumbWrap}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={mediaUrl(url, API_BASE)} alt="" />
                              <button
                                type="button"
                                onClick={() =>
                                  setExistingImages((prev) =>
                                    prev.filter((u) => u !== url)
                                  )
                                }
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          {imageFiles.map((f) => (
                            <div key={f.name} className={styles.thumbWrap}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={URL.createObjectURL(f)} alt="" />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Visibility</label>
                    <div className={styles.toggleRow}>
                      <span className={styles.toggleLabel}>
                        {form.is_active ? "Active" : "Hidden"}
                      </span>
                      <button
                        type="button"
                        className={`${styles.toggle} ${form.is_active ? styles.toggleOn : ""}`}
                        onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                        aria-pressed={form.is_active}
                      >
                        <span className={styles.toggleThumb} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right — video upload */}
                <div className={styles.formRight}>
                  <label className={styles.label}>Product Video</label>
                  <div
                    className={styles.videoDropZone}
                    onClick={() => fileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
                    }}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/avi"
                      style={{ display: "none" }}
                      onChange={(e) => handleVideoFile(e.target.files?.[0])}
                    />
                    {videoPreview ? (
                      <video
                        src={videoPreview}
                        className={styles.videoPreview}
                        controls
                        muted
                        playsInline
                      />
                    ) : (
                      <div className={styles.dropPlaceholder}>
                        <div className={styles.dropIcon}>🎬</div>
                        <p className={styles.dropText}>
                          <strong>Click to upload</strong> video
                        </p>
                        <p className={styles.dropSub}>MP4, WEBM, MOV · max recommended 50 MB</p>
                      </div>
                    )}
                  </div>
                  {videoFile && <p className={styles.fileName}>📎 {videoFile.name}</p>}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? <><span className={styles.btnSpinner} /> Saving…</> : editing ? "Save Changes" : "Create Video Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
