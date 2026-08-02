"use client";

import { useEffect, useState } from "react";
import { FiLock, FiUnlock } from "react-icons/fi";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { getAdminMe, updateAdminProfile } from "@/services/adminService";
import styles from "./profile.module.css";

export default function AdminProfilePage() {
  const { setAdmin } = useAdminAuth();
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    company_name: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminMe()
      .then((res) => {
        const p = res.data || {};
        setForm({
          email: p.email || "",
          name: p.name || "",
          phone: p.phone || "",
          company_name: p.company_name || "",
        });
        setLocked(true);
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const onChange = (e) => {
    if (locked) return;
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage("");
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (locked) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await updateAdminProfile({
        email: form.email.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        company_name: form.company_name.trim(),
      });
      const updated = res.data;
      localStorage.setItem("admin_user", JSON.stringify(updated));
      setAdmin?.(updated);
      setForm({
        email: updated.email || "",
        name: updated.name || "",
        phone: updated.phone || "",
        company_name: updated.company_name || "",
      });
      setLocked(true);
      setMessage(
        "Profile saved and locked. New orders will SMS this number when a phone is set."
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Failed to save profile. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loader}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Admin Profile</h2>
          <button
            type="button"
            className={styles.lockBtn}
            onClick={() => {
              setLocked((prev) => !prev);
              setMessage("");
              setError("");
            }}
            aria-label={locked ? "Unlock profile for editing" : "Lock profile"}
            title={locked ? "Unlock to edit" : "Lock"}
          >
            {locked ? <FiLock size={18} /> : <FiUnlock size={18} />}
          </button>
        </div>
        <p className={styles.subtitle}>
          Company details and the mobile number that receives new-order SMS
          alerts.
          {locked ? " Profile is locked — click the lock to edit." : ""}
        </p>
      </div>

      <form
        className={`${styles.card} ${locked ? styles.locked : ""}`}
        onSubmit={onSubmit}
      >
        {message ? <div className={styles.success}>{message}</div> : null}
        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="company_name">
            Company name
          </label>
          <input
            id="company_name"
            name="company_name"
            className={styles.input}
            value={form.company_name}
            onChange={onChange}
            placeholder="ChaklaDekho"
            disabled={locked}
            readOnly={locked}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            Display name
          </label>
          <input
            id="name"
            name="name"
            className={styles.input}
            value={form.name}
            onChange={onChange}
            placeholder="Vikram Bhai"
            disabled={locked}
            readOnly={locked}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Admin email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            value={form.email}
            onChange={onChange}
            placeholder="admin@chakladkho.com"
            required
            disabled={locked}
            readOnly={locked}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="phone">
            Notification mobile number
          </label>
          <div className={styles.phoneWrap}>
            <span className={styles.prefix}>+91</span>
            <input
              id="phone"
              name="phone"
              className={styles.input}
              value={form.phone}
              onChange={onChange}
              placeholder="9699164131"
              inputMode="numeric"
              maxLength={10}
              disabled={locked}
              readOnly={locked}
            />
          </div>
          <p className={styles.hint}>
            When a customer places an order, you will get an sms on this number
            with order ID.
          </p>
        </div>

        {!locked ? (
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving…" : "Save and Lock"}
          </button>
        ) : (
          <p className={styles.lockedHint}>
            Details are locked. Click the lock icon next to Admin Profile to
            unlock and edit.
          </p>
        )}
      </form>
    </div>
  );
}
