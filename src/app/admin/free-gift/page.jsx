"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiGift, FiUpload } from "react-icons/fi";

import {
  getAdminFreeGift,
  removeFreeGiftImage,
  updateFreeGift,
  uploadFreeGiftImage,
} from "@/services/adminService";
import { fetchFreeGift } from "@/services/freeGiftService";
import { mediaUrl } from "@/utils/mediaUrl";
import styles from "./free-gift.module.css";

function errorMessage(err, fallback) {
  return err?.response?.data?.detail || err?.message || fallback;
}

export default function AdminFreeGiftPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [savedTitle, setSavedTitle] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const fileRef = useRef(null);

  const apply = (data) => {
    setTitle(data?.title || "");
    setSavedTitle(data?.title || "");
    setIsActive(!!data?.is_active);
    setImageUrl(data?.image_url || "");
  };

  useEffect(() => {
    getAdminFreeGift()
      .then((res) => apply(res.data))
      .catch((err) => toast.error(errorMessage(err, "Failed to load free gift")))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    const next = !isActive;
    if (next && !savedTitle.trim()) {
      toast.error("Save a title first, then turn the free gift on");
      return;
    }
    setToggling(true);
    try {
      const res = await updateFreeGift({ is_active: next });
      setIsActive(!!res.data?.is_active);
      fetchFreeGift({ fresh: true });
      toast.success(
        res.data?.is_active
          ? "Free gift is now showing to customers"
          : "Free gift is now hidden from customers",
      );
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update"));
    } finally {
      setToggling(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isActive && !title.trim()) {
      toast.error("Title can't be empty while the free gift is on");
      return;
    }
    setSaving(true);
    try {
      const res = await updateFreeGift({ title: title.trim() });
      setTitle(res.data?.title || "");
      setSavedTitle(res.data?.title || "");
      toast.success("Title saved");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await uploadFreeGiftImage(formData);
      setImageUrl(res.data?.image_url || "");
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(errorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm("Remove the gift image?")) return;
    try {
      const res = await removeFreeGiftImage();
      setImageUrl(res.data?.image_url || "");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to remove image"));
    }
  };

  if (loading) return <p className={styles.muted}>Loading…</p>;

  const previewTitle = title.trim() || "Free Taveta worth Rs 99";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Free Gift</h2>
        <p className={styles.subtitle}>
          When enabled, this gift is shown as a free item in the cart and in the
          checkout &ldquo;Your box&rdquo; summary on every order.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.toggleRow}>
          <div>
            <strong className={styles.toggleLabel}>Show free gift to customers</strong>
            <p className={isActive ? styles.statusOn : styles.statusOff}>
              {isActive
                ? "On — customers see it in cart and checkout"
                : "Off — hidden from customers"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-label="Show free gift to customers"
            className={`${styles.switch} ${isActive ? styles.switchOn : ""}`}
            onClick={handleToggle}
            disabled={toggling}
          >
            <span className={styles.knob} />
          </button>
        </div>
        <p className={styles.muted}>
          The switch saves instantly. Title and image are saved separately below.
        </p>
      </div>

      <form className={styles.card} onSubmit={handleSave}>
        <label className={styles.field}>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Free Taveta worth Rs 99"
            maxLength={255}
          />
        </label>

        <div className={styles.field}>
          Image
          <div className={styles.imageRow}>
            <div className={styles.imageBox}>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(imageUrl)} alt="Free gift" />
              ) : (
                <FiGift size={30} aria-hidden="true" />
              )}
            </div>
            <div className={styles.imageActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                <FiUpload aria-hidden="true" />{" "}
                {uploading ? "Uploading…" : imageUrl ? "Replace image" : "Upload image"}
              </button>
              {imageUrl ? (
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={handleRemoveImage}
                >
                  Remove image
                </button>
              ) : null}
              <p className={styles.muted}>Square image works best (e.g. 600×600).</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFile}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving…" : "Save title"}
          </button>
        </div>
      </form>

      <div className={styles.card}>
        <h3 className={styles.previewHeading}>Preview in cart</h3>
        <div className={styles.preview}>
          <div className={styles.previewImg}>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(imageUrl)} alt="" />
            ) : (
              <FiGift size={24} aria-hidden="true" />
            )}
          </div>
          <div className={styles.previewText}>
            <strong>{previewTitle}</strong>
            <span>Free gift with your order</span>
          </div>
          <span className={styles.previewQty}>1</span>
          <span className={styles.previewFree}>FREE</span>
        </div>
      </div>
    </div>
  );
}
