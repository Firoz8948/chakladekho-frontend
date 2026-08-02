"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  updateProduct,
  getAdminProduct,
  uploadProductImages,
  removeProductImage,
  getAdminMetafields,
  getAdminCategories,
} from "@/services/adminService";
import { parseWeightGrams } from "@/utils/productVariants";
import { mediaUrl } from "@/utils/mediaUrl";
import styles from "./ProductForm.module.css";

const UNITS = ["piece", "set", "kg"];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Variant Builder (Shopify-style) ──────────────────────────────────────────
function VariantBuilder({ variants, onChange }) {
  const addVariant = () => {
    onChange([...variants, { name: "", options: [{ name: "", price: "", mrp: "", stock: "", weight: "" }] }]);
  };

  const removeVariant = (vi) => {
    onChange(variants.filter((_, i) => i !== vi));
  };

  const updateVariantName = (vi, name) => {
    const updated = [...variants];
    updated[vi] = { ...updated[vi], name };
    onChange(updated);
  };

  const addOption = (vi) => {
    const updated = [...variants];
    updated[vi].options = [...updated[vi].options, { name: "", price: "", mrp: "", stock: "", weight: "" }];
    onChange(updated);
  };

  const removeOption = (vi, oi) => {
    const updated = [...variants];
    updated[vi].options = updated[vi].options.filter((_, i) => i !== oi);
    onChange(updated);
  };

  const updateOption = (vi, oi, field, value) => {
    const updated = [...variants];
    updated[vi].options[oi] = { ...updated[vi].options[oi], [field]: value };
    if (field === "name") {
      const parsed = parseWeightGrams(value);
      if (parsed && !updated[vi].options[oi].weight) {
        updated[vi].options[oi].weight = parsed;
      }
    }
    onChange(updated);
  };

  return (
    <div className={styles.variantSection}>
      <div className={styles.variantHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Variants</h3>
          <p className={styles.sectionSub}>Add sizes, packs, or any option</p>
        </div>
        <button type="button" className={styles.addVariantBtn} onClick={addVariant}>
          + Add Variant
        </button>
      </div>

      {variants.length === 0 && (
        <div className={styles.noVariants}>
          <span>🎛️</span>
          <p>
            No variants added. Click &quot;Add Variant&quot; to create options
            like Diameter, Capacity, or Set Size.
          </p>
        </div>
      )}

      {variants.map((variant, vi) => (
        <div key={vi} className={styles.variantCard}>
          <div className={styles.variantTop}>
            <div className={styles.field}>
              <label className={styles.label}>Variant Type</label>
              <input
                className={styles.input}
                placeholder="e.g. Weight, Pack Size, Roast Type"
                value={variant.name}
                onChange={(e) => updateVariantName(vi, e.target.value)}
              />
            </div>
            <button
              type="button"
              className={styles.removeVariantBtn}
              onClick={() => removeVariant(vi)}
            >
              Remove
            </button>
          </div>

          {/* Options table */}
          <div className={styles.optionsTable}>
            <div className={styles.optionsHead}>
              <span>Option Name</span>
              <span>Selling Price (₹)</span>
              <span>MRP (₹)</span>
              <span>Stock</span>
              <span>Weight (g)</span>
              <span></span>
            </div>

            {variant.options.map((opt, oi) => (
              <div key={oi} className={styles.optionRow}>
                <input
                  className={styles.optInput}
                  placeholder="e.g. 250g, 500g, 1kg"
                  value={opt.name}
                  onChange={(e) => updateOption(vi, oi, "name", e.target.value)}
                />
                <input
                  className={styles.optInput}
                  type="number"
                  placeholder="299"
                  value={opt.price}
                  onChange={(e) => updateOption(vi, oi, "price", e.target.value)}
                />
                <input
                  className={styles.optInput}
                  type="number"
                  placeholder="399"
                  value={opt.mrp}
                  onChange={(e) => updateOption(vi, oi, "mrp", e.target.value)}
                />
                <input
                  className={styles.optInput}
                  type="number"
                  placeholder="50"
                  value={opt.stock}
                  onChange={(e) => updateOption(vi, oi, "stock", e.target.value)}
                />
                <input
                  className={styles.optInput}
                  type="number"
                  placeholder="500"
                  min="0"
                  value={opt.weight ?? ""}
                  onChange={(e) => updateOption(vi, oi, "weight", e.target.value)}
                  title="Weight in grams for shipping"
                />
                <button
                  type="button"
                  className={styles.removeOptBtn}
                  onClick={() => removeOption(vi, oi)}
                  disabled={variant.options.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              className={styles.addOptBtn}
              onClick={() => addOption(vi)}
            >
              + Add Option
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Image Uploader ────────────────────────────────────────────────────────────
function ImageUploader({ productId, images, onImagesChange, pendingFiles, onPendingFiles }) {
  const fileRef = useRef();
  const [removing, setRemoving] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    onPendingFiles((prev) => [...prev, ...valid]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePending = (index) => {
    onPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExisting = async (url) => {
    if (!productId) return;
    setRemoving(url);
    try {
      await removeProductImage(productId, url);
      onImagesChange((prev) => prev.filter((u) => u !== url));
    } catch {
      alert("Failed to remove image.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className={styles.imageSection}>
      <h3 className={styles.sectionTitle}>Product Images</h3>
      <p className={styles.sectionSub}>Square images recommended (1:1 ratio). First image = main image.</p>

      {/* Drop Zone */}
      <div
        className={`${styles.dropZone} ${dragging ? styles.dragging : ""}`}
        onClick={() => fileRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className={styles.dropIcon}>📸</div>
        <p className={styles.dropText}>
          <strong>Click to upload</strong> or drag & drop
        </p>
        <p className={styles.dropSub}>PNG, JPG, WEBP · Square ratio preferred</p>
      </div>

      {/* Image Grid */}
      {(images.length > 0 || pendingFiles.length > 0) && (
        <div className={styles.imageGrid}>
          {/* Existing saved images */}
          {images.map((url, i) => (
            <div key={url} className={styles.imageItem}>
              {i === 0 && <span className={styles.mainBadge}>Main</span>}
              <img src={mediaUrl(url, API_BASE)} alt={`Product ${i + 1}`} />
              <button
                type="button"
                className={styles.removeImgBtn}
                onClick={() => removeExisting(url)}
                disabled={removing === url}
              >
                {removing === url ? "…" : "✕"}
              </button>
            </div>
          ))}

          {/* Pending (not yet uploaded) */}
          {pendingFiles.map((file, i) => (
            <div key={i} className={`${styles.imageItem} ${styles.pending}`}>
              <span className={styles.pendingBadge}>Pending</span>
              <img src={URL.createObjectURL(file)} alt={file.name} />
              <button
                type="button"
                className={styles.removeImgBtn}
                onClick={() => removePending(i)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────
export default function ProductForm({ mode = "add", productId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  // Image state
  const [images, setImages] = useState([]);        // saved URLs
  const [pendingFiles, setPendingFiles] = useState([]); // File objects

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    mrp: "",
    category_id: "",
    stock: "",
    unit: "piece",
    weight: "",
    length_cm: "",
    breadth_cm: "",
    height_cm: "",
    is_featured: false,
    is_active: true,
    tags: "",
  });

  const [variants, setVariants] = useState([]);
  const [metafieldDefs, setMetafieldDefs] = useState([]);
  const [metafields, setMetafields] = useState({});
  const [categories, setCategories] = useState([]);

  const selectedCategory = categories.find(
    (c) => String(c.id) === String(form.category_id)
  );

  useEffect(() => {
    getAdminCategories()
      .then((res) => {
        const list = res.data || [];
        setCategories(list);
        if (mode === "add" && list.length) {
          const cat = list[0];
          setForm((prev) =>
            prev.category_id
              ? prev
              : {
                  ...prev,
                  category_id: String(cat.id),
                }
          );
        }
      })
      .catch(() => setCategories([]));

    getAdminMetafields()
      .then((res) => setMetafieldDefs(res.data || []))
      .catch(() => {});
  }, [mode]);

  // Load product for edit
  useEffect(() => {
    if (mode === "edit" && productId) {
      setFetching(true);
      getAdminProduct(productId)
        .then((res) => {
          const p = res.data;
          setForm({
            name: p.name || "",
            description: p.description || "",
            price: p.price || "",
            mrp: p.mrp || "",
            category_id: p.category_id ? String(p.category_id) : "",
            stock: p.stock || "",
            unit: p.unit || "piece",
            weight: p.weight || "",
            length_cm: p.length_cm || "",
            breadth_cm: p.breadth_cm || "",
            height_cm: p.height_cm || "",
            is_featured: p.is_featured || false,
            is_active: p.is_active ?? true,
            tags: (p.tags || []).join(", "),
          });
          setImages(p.images || []);
          setVariants(p.variants || []);
          setMetafields(p.metafields || {});
        })
        .catch(() => alert("Failed to load product."))
        .finally(() => setFetching(false));
    }
  }, [mode, productId]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = "Valid selling price required";
    if (!form.mrp || isNaN(form.mrp) || Number(form.mrp) <= 0)
      e.mrp = "Valid MRP required";
    if (Number(form.price) > Number(form.mrp))
      e.price = "Selling price cannot exceed MRP";
    if (!form.category_id) e.category_id = "Category required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        mrp: parseFloat(form.mrp),
        category: selectedCategory?.name || "",
        category_id: parseInt(form.category_id, 10),
        stock: parseInt(form.stock) || 0,
        unit: form.unit,
        weight: form.weight ? parseFloat(form.weight) : null,
        length_cm: form.length_cm ? parseFloat(form.length_cm) : null,
        breadth_cm: form.breadth_cm ? parseFloat(form.breadth_cm) : null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        is_featured: form.is_featured,
        is_active: form.is_active,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        variants: variants.map((v) => ({
          name: v.name,
          options: v.options.map((o) => ({
            name: o.name,
            price: parseFloat(o.price) || 0,
            mrp: parseFloat(o.mrp) || 0,
            stock: parseInt(o.stock) || 0,
            weight: o.weight ? parseFloat(o.weight) : parseWeightGrams(o.name),
          })),
        })),
        metafields,
      };

      let savedProduct;
      if (mode === "add") {
        const res = await createProduct(payload);
        savedProduct = res.data;
      } else {
        const res = await updateProduct(productId, payload);
        savedProduct = res.data;
      }

      // Upload pending images
      if (pendingFiles.length > 0) {
        const fd = new FormData();
        pendingFiles.forEach((file) => fd.append("files", file));
        await uploadProductImages(savedProduct.id, fd);
      }

      setSuccessMsg(mode === "add" ? "Product created successfully!" : "Product updated!");
      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) return (
    <div className={styles.loader}>
      <div className={styles.spinner} />
      <p>Loading product…</p>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => router.push("/admin/products")}>
          ← Back
        </button>
        <div>
          <h2 className={styles.pageTitle}>
            {mode === "add" ? "Add New Product" : "Edit Product"}
          </h2>
          <p className={styles.pageSub}>
            {mode === "add" ? "Create a new product listing" : "Update product details"}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className={styles.successBanner}>
          ✅ {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.formGrid}>
          {/* LEFT COLUMN */}
          <div className={styles.leftCol}>

            {/* Basic Info */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Basic Information</h3>

              <div className={styles.field}>
                <label className={styles.label}>Product Name *</label>
                <input
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  placeholder="e.g. Wooden Chakla 12 inch"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
                {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  placeholder={`Supports plain text or HTML.\n\nExample:\n<ul>\n  <li>Smooth rolling surface</li>\n  <li>Comfortable grip</li>\n</ul>\n<img src="/uploads/products/your-image.webp" alt="Detail" />`}
                  rows={8}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
                <span className={styles.hint}>
                  You can use HTML for bullet lists and images (upload image to
                  Bunny first, then paste the CDN URL in an{" "}
                  <code>&lt;img src=&quot;...&quot; /&gt;</code> tag).
                </span>
              </div>
            </div>

            {/* Images */}
            <div className={styles.card}>
              <ImageUploader
                productId={mode === "edit" ? productId : null}
                images={images}
                onImagesChange={setImages}
                pendingFiles={pendingFiles}
                onPendingFiles={setPendingFiles}
              />
            </div>

            {/* Variants */}
            <div className={styles.card}>
              <VariantBuilder variants={variants} onChange={setVariants} />
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightCol}>

            {/* Pricing */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Pricing</h3>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Selling Price (₹) *</label>
                  <div className={styles.priceInput}>
                    <span className={styles.currency}>₹</span>
                    <input
                      className={`${styles.input} ${errors.price ? styles.inputError : ""}`}
                      type="number"
                      placeholder="299"
                      min="0"
                      value={form.price}
                      onChange={(e) => setField("price", e.target.value)}
                    />
                  </div>
                  {errors.price && <span className={styles.errMsg}>{errors.price}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>MRP (₹) *</label>
                  <div className={styles.priceInput}>
                    <span className={styles.currency}>₹</span>
                    <input
                      className={`${styles.input} ${errors.mrp ? styles.inputError : ""}`}
                      type="number"
                      placeholder="399"
                      min="0"
                      value={form.mrp}
                      onChange={(e) => setField("mrp", e.target.value)}
                    />
                  </div>
                  {errors.mrp && <span className={styles.errMsg}>{errors.mrp}</span>}
                </div>
              </div>

              {form.price && form.mrp && Number(form.mrp) > 0 && (
                <div className={styles.discountBadge}>
                  🏷️ {Math.round((1 - form.price / form.mrp) * 100)}% off
                </div>
              )}
            </div>

            {/* Category & Inventory */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Category & Inventory</h3>

              <div className={styles.field}>
                <label className={styles.label}>Category *</label>
                <select
                  className={`${styles.select} ${errors.category_id ? styles.inputError : ""}`}
                  value={form.category_id}
                  onChange={(e) => setField("category_id", e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <span className={styles.hint}>
                    No categories yet. Create one under Admin → Categories.
                  </span>
                )}
                {errors.category_id && (
                  <span className={styles.errMsg}>{errors.category_id}</span>
                )}
              </div>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Stock Quantity</label>
                  <input
                    className={styles.input}
                    type="number"
                    placeholder="100"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setField("stock", e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Unit</label>
                  <select
                    className={styles.select}
                    value={form.unit}
                    onChange={(e) => setField("unit", e.target.value)}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Weight (grams) — for shipping</label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="250"
                  min="0"
                  value={form.weight}
                  onChange={(e) => setField("weight", e.target.value)}
                />
              </div>

              <div className={styles.row3}>
                <div className={styles.field}>
                  <label className={styles.label}>Length (cm)</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.length_cm}
                    onChange={(e) => setField("length_cm", e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Breadth (cm)</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.breadth_cm}
                    onChange={(e) => setField("breadth_cm", e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Height (cm)</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.height_cm}
                    onChange={(e) => setField("height_cm", e.target.value)}
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            {/* Metafields */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Metafields</h3>
              <p className={styles.sectionSub}>
                Add content for sections shown on the product page (manage field names in Metafields menu).
              </p>

              {metafieldDefs.length === 0 ? (
                <p className={styles.hint}>
                  No metafields defined yet. Go to Admin → Metafields to add sections like &quot;Key Features&quot;.
                </p>
              ) : (
                metafieldDefs
                  .filter((d) => d.is_active)
                  .map((def) => (
                    <div key={def.id} className={styles.field}>
                      <label className={styles.label}>{def.name}</label>
                      <textarea
                        className={styles.textarea}
                        rows={4}
                        placeholder={`Enter ${def.name.toLowerCase()}…`}
                        value={metafields[def.key] || ""}
                        onChange={(e) =>
                          setMetafields((prev) => ({ ...prev, [def.key]: e.target.value }))
                        }
                      />
                    </div>
                  ))
              )}

              <div className={styles.field}>
                <label className={styles.label}>Tags (comma separated)</label>
                <input
                  className={styles.input}
                  placeholder="premium, roasted, healthy, gift"
                  value={form.tags}
                  onChange={(e) => setField("tags", e.target.value)}
                />
                <span className={styles.hint}>Used for filtering and SEO</span>
              </div>
            </div>

            {/* Status */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Product Status</h3>

              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleLabel}>Active</div>
                  <div className={styles.toggleSub}>Visible on website</div>
                </div>
                <button
                  type="button"
                  className={`${styles.toggle} ${form.is_active ? styles.toggleOn : ""}`}
                  onClick={() => setField("is_active", !form.is_active)}
                  aria-label="Toggle active"
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleLabel}>Featured</div>
                  <div className={styles.toggleSub}>Show on home page</div>
                </div>
                <button
                  type="button"
                  className={`${styles.toggle} ${form.is_featured ? styles.toggleOn : ""}`}
                  onClick={() => setField("is_featured", !form.is_featured)}
                  aria-label="Toggle featured"
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            </div>

            {/* Save */}
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className={styles.btnSpinner} />
                  Saving…
                </>
              ) : (
                mode === "add" ? "Create Product" : "Save Changes"
              )}
            </button>

          </div>
        </div>
      </form>
    </div>
  );
}
