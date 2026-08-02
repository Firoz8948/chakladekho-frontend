"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  createPromoCode,
  deletePromoCode,
  getAdminPromoCodes,
  getPromoCodeUsage,
  updatePromoCode,
} from "@/services/adminService";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./promocodes.module.css";

const emptyForm = {
  code: "",
  action_type: "free_shipping",
  percent_value: 20,
  valid_from: "",
  valid_to: "",
  audience: "all",
  max_uses: "",
  is_active: true,
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminPromoCodesPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    ...emptyForm,
    valid_from: todayISO(),
    valid_to: todayISO(),
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [usagePromo, setUsagePromo] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAdminPromoCodes();
      setPromos(res.data || []);
    } catch (e) {
      toast.error(e.message || "Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      valid_from: todayISO(),
      valid_to: todayISO(),
    });
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (promo) => {
    setEditingId(promo.id);
    setForm({
      code: promo.code,
      action_type: promo.action_type,
      percent_value: promo.percent_value || 20,
      valid_from: promo.valid_from,
      valid_to: promo.valid_to,
      audience: promo.audience || "all",
      max_uses: promo.max_uses ?? "",
      is_active: promo.is_active,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error("Enter a promo code");
      return;
    }
    if (!form.valid_from || !form.valid_to) {
      toast.error("Select validity dates");
      return;
    }
    if (
      form.action_type === "percent_off" &&
      (!form.percent_value || Number(form.percent_value) <= 0)
    ) {
      toast.error("Enter a valid percent");
      return;
    }

    const maxUsesRaw = String(form.max_uses ?? "").trim();
    const maxUses = maxUsesRaw === "" ? null : Number(maxUsesRaw);
    if (maxUsesRaw !== "" && (!Number.isFinite(maxUses) || maxUses < 1)) {
      toast.error("Max uses must be a positive number");
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      action_type: form.action_type,
      percent_value:
        form.action_type === "percent_off" ? Number(form.percent_value) : null,
      valid_from: form.valid_from,
      valid_to: form.valid_to,
      audience: form.audience || "all",
      max_uses: maxUses,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updatePromoCode(editingId, payload);
        toast.success("Promo code updated");
      } else {
        await createPromoCode(payload);
        toast.success("Promo code created");
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promo) => {
    if (!confirm(`Delete promo code ${promo.code}?`)) return;
    try {
      await deletePromoCode(promo.id);
      toast.success("Deleted");
      if (editingId === promo.id) resetForm();
      if (usagePromo?.id === promo.id) setUsagePromo(null);
      load();
    } catch (e) {
      toast.error(e.message || "Failed to delete");
    }
  };

  const handleViewUsage = async (promo) => {
    setUsageLoading(true);
    try {
      const res = await getPromoCodeUsage(promo.id);
      setUsagePromo(res.data);
    } catch (e) {
      toast.error(e?.response?.data?.detail || e.message || "Failed to load usage");
    } finally {
      setUsageLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Promo Codes</h2>
          <p className={styles.subtitle}>
            Create coupons with validity, audience (new or all users), and a
            max use count. Exhausted codes deactivate automatically.
          </p>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit promo code" : "Create promo code"}</h3>
        <div className={styles.grid}>
          <label>
            Code
            <input
              name="code"
              value={form.code}
              onChange={onChange}
              placeholder="FREESHIP"
              required
            />
          </label>

          <label>
            Action
            <select
              name="action_type"
              value={form.action_type}
              onChange={onChange}
            >
              <option value="free_shipping">Free shipping</option>
              <option value="percent_off">Percent off</option>
            </select>
          </label>

          {form.action_type === "percent_off" && (
            <label>
              Percent
              <div className={styles.percentRow}>
                <select
                  value={[10, 20, 30].includes(Number(form.percent_value))
                    ? String(form.percent_value)
                    : "custom"}
                  onChange={(e) => {
                    if (e.target.value === "custom") return;
                    setForm((prev) => ({
                      ...prev,
                      percent_value: Number(e.target.value),
                    }));
                  }}
                >
                  <option value="10">10% off</option>
                  <option value="20">20% off</option>
                  <option value="30">30% off</option>
                  <option value="custom">Custom</option>
                </select>
                <input
                  name="percent_value"
                  type="number"
                  min={1}
                  max={100}
                  value={form.percent_value}
                  onChange={onChange}
                />
              </div>
            </label>
          )}

          <label>
            Valid from
            <input
              type="date"
              name="valid_from"
              value={form.valid_from}
              onChange={onChange}
              required
            />
          </label>

          <label>
            Valid to
            <input
              type="date"
              name="valid_to"
              value={form.valid_to}
              onChange={onChange}
              required
            />
          </label>

          <label>
            Audience
            <select name="audience" value={form.audience} onChange={onChange}>
              <option value="all">All users</option>
              <option value="new_users">New users only</option>
            </select>
          </label>

          <label>
            Max uses
            <input
              name="max_uses"
              type="number"
              min={1}
              value={form.max_uses}
              onChange={onChange}
              placeholder="Unlimited"
            />
          </label>

          <label className={styles.check}>
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={onChange}
            />
            Active
          </label>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving
              ? "Saving…"
              : editingId
                ? "Update Promo"
                : "Create Promo"}
          </button>
          {editingId && (
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className={styles.tableWrap}>
        <h3>All coupons</h3>
        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : promos.length === 0 ? (
          <p className={styles.muted}>No promo codes yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Action</th>
                <th>Audience</th>
                <th>Uses</th>
                <th>Valid from</th>
                <th>Valid to</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo.id}>
                  <td>
                    <strong>{promo.code}</strong>
                  </td>
                  <td>{promo.action_label}</td>
                  <td>
                    {promo.audience === "new_users" ? "New users" : "All users"}
                  </td>
                  <td>
                    {promo.max_uses == null
                      ? `${promo.uses_count || 0} / ∞`
                      : `${promo.uses_count || 0} / ${promo.max_uses} (${promo.remaining_uses ?? 0} left)`}
                  </td>
                  <td>{promo.valid_from}</td>
                  <td>{promo.valid_to}</td>
                  <td>
                    <span
                      className={
                        promo.is_active ? styles.active : styles.inactive
                      }
                    >
                      {promo.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className={styles.rowActions}>
                    <button type="button" onClick={() => handleViewUsage(promo)}>
                      Usage
                    </button>
                    <button type="button" onClick={() => handleEdit(promo)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.danger}
                      onClick={() => handleDelete(promo)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(usagePromo || usageLoading) && (
        <div className={styles.tableWrap}>
          <div className={styles.usageHeader}>
            <h3>
              {usagePromo
                ? `Usage — ${usagePromo.code}`
                : "Loading usage…"}
            </h3>
            {usagePromo ? (
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setUsagePromo(null)}
              >
                Close
              </button>
            ) : null}
          </div>
          {usageLoading ? (
            <p className={styles.muted}>Loading…</p>
          ) : usagePromo?.usages?.length ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Products</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {usagePromo.usages.map((row) => (
                  <tr key={row.order_id}>
                    <td>#{row.order_id}</td>
                    <td>{row.customer_name || "—"}</td>
                    <td>{row.customer_phone || "—"}</td>
                    <td>
                      {(row.products || [])
                        .map((p) => `${p.name} × ${p.quantity}`)
                        .join(", ") || "—"}
                    </td>
                    <td>{formatPrice(row.discount_amount || 0)}</td>
                    <td>{formatPrice(row.total || 0)}</td>
                    <td>
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.muted}>No orders have used this code yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
