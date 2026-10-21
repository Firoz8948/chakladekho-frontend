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
  // Last saved state on the server
  const [saved, setSaved] = useState({ title: "", is_active: false, image_url: "" });
  // Form state (applied only when Save is clicked)
  const [title, setTitle] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const fileRef = useRef(null);

  const apply = (data) => {
    const next = {
      title: data?.title || "",
      is_active: !!data?.is_active,
      image_url: data?.image_url || "",
    };
    setSaved(next);
    setTitle(next.title);
    setIsActive(next.is_active);
    setPendingFile(null);
    setRemoveImage(false);
  };

  useEffect(() => {
    getAdminFreeGift()
      .then((res) => apply(res.data))
      .catch((err) => toast.error(errorMessage(err, "Failed to load free gift")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!pendingFile) {
      setPendingPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(pendingFile);
    setPendingPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setPendingFile(file);
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setPendingFile(null);
    setRemoveImage(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isActive && !title.trim()) {
      toast.error("Add a title before turning the free gift on");
      return;
    }
    setSaving(true);
    try {
      if (pendingFile) {
        const formData = new FormData();
        formData.append("file", pendingFile);
        await uploadFreeGiftImage(formData);
      } else if (removeImage && saved.image_url) {
        await removeFreeGiftImage();
      }
      const res = await updateFreeGift({ title: title.trim(), is_active: isActive });
      apply(res.data);
      fetchFreeGift({ fresh: true });
      toast.success(
        res.data?.is_active
          ? "Saved — free gift is showing to customers"
          : "Saved — free gift is hidden from customers",
      );
    } catch (err) {
      toast.error(errorMessage(err, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className={styles.muted}>Loading…</p>;

  const imageSrc = pendingPreview || (removeImage ? "" : mediaUrl(saved.image_url));
  const dirty =
    title.trim() !== saved.title ||
    isActive !== saved.is_active ||
    !!pendingFile ||
    (removeImage && !!saved.image_url);
  const previewTitle = title.trim() || "Free Taveta worth Rs 99";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Free Gift</h2>
        <p className={styles.subtitle}>
          When on, this gift is shown as a free item in the cart and in the
          checkout &ldquo;Your box&rdquo; summary on every order.
        </p>
      </div>

      <form className={styles.card} onSubmit={handleSave}>
        <p className={saved.is_active ? styles.statusOn : styles.statusOff}>
          Customers currently see: {saved.is_active ? "Free gift ON" : "Free gift OFF"}
        </p>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Show free gift to customers
        </label>

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
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageSrc} alt="Free gift" />
              ) : (
                <FiGift size={30} aria-hidden="true" />
              )}
            </div>
            <div className={styles.imageActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => fileRef.current?.click()}
              >
                <FiUpload aria-hidden="true" /> {imageSrc ? "Replace image" : "Choose image"}
              </button>
              {imageSrc ? (
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
          <button type="submit" className={styles.saveBtn} disabled={saving || !dirty}>
            {saving ? "Saving…" : "Save"}
          </button>
          {dirty && !saving ? (
            <span className={styles.unsaved}>You have unsaved changes</span>
          ) : null}
        </div>
      </form>

      <div className={styles.card}>
        <h3 className={styles.previewHeading}>Preview in cart</h3>
        <div className={styles.preview}>
          <div className={styles.previewImg}>
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageSrc} alt="" />
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
