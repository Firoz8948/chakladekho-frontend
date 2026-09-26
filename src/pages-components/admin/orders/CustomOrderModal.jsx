"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { createCustomOrder, getAdminProducts } from "@/services/adminService";
import { INDIAN_STATES, lookupPincode } from "@/utils/indiaAddress";
import styles from "./CustomOrderModal.module.css";

const emptyForm = {
  product_id: "",
  quantity: 1,
  shipping_charge: "0",
  payment_type: "cod",
  name: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CustomOrderModal({ open, onClose, onCreated }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setLoadingProducts(true);
    getAdminProducts({ page: 1, limit: 100 })
      .then((res) => {
        const list = (res.data?.products || []).filter((p) => p.is_active !== false);
        setProducts(list);
      })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoadingProducts(false));
  }, [open]);

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === String(form.product_id)),
    [products, form.product_id]
  );

  const subtotal = useMemo(() => {
    if (!selectedProduct) return 0;
    return Number(selectedProduct.price || 0) * Number(form.quantity || 0);
  }, [selectedProduct, form.quantity]);

  const shipping = Number(form.shipping_charge || 0);
  const total = Math.max(0, subtotal) + (Number.isFinite(shipping) ? shipping : 0);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handlePincodeBlur = async () => {
    const pin = String(form.pincode || "").trim();
    if (pin.length !== 6) return;
    try {
      const info = await lookupPincode(pin);
      if (!info?.ok) return;
      setForm((prev) => ({
        ...prev,
        city: info.city || prev.city,
        state: info.state || prev.state,
      }));
    } catch {
      /* ignore lookup failures */
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id) {
      toast.error("Select a product");
      return;
    }
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error("Enter customer name");
      return;
    }
    const phoneDigits = String(form.phone).replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      toast.error("Enter a valid 10-digit phone");
      return;
    }
    if (!form.line1.trim() || !form.city.trim() || !form.state.trim()) {
      toast.error("Fill delivery address");
      return;
    }
    if (!/^\d{6}$/.test(String(form.pincode).trim())) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    if (Number(form.shipping_charge) < 0 || Number.isNaN(Number(form.shipping_charge))) {
      toast.error("Enter a valid shipping charge");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createCustomOrder({
        product_id: Number(form.product_id),
        quantity: Number(form.quantity) || 1,
        shipping_charge: Number(form.shipping_charge) || 0,
        payment_type: form.payment_type,
        customer: {
          name: form.name.trim(),
          phone: phoneDigits.slice(-10),
          email: form.email.trim() || null,
        },
        address: {
          line1: form.line1.trim(),
          line2: form.line2.trim() || null,
          landmark: form.landmark.trim() || null,
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
      });
      toast.success(`Order ${res.data?.order_id || ""} placed`);
      onCreated?.(res.data);
      onClose?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || err.message || "Failed to place order"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-order-title"
      >
        <div className={styles.modalHeader}>
          <h3 id="custom-order-title">Custom Order</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <label className={styles.full}>
              Product
              <select
                value={form.product_id}
                onChange={(e) => setField("product_id", e.target.value)}
                required
                disabled={loadingProducts}
              >
                <option value="">
                  {loadingProducts ? "Loading products…" : "Select product"}
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{Number(p.price).toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Quantity
              <input
                type="number"
                min={1}
                max={999}
                value={form.quantity}
                onChange={(e) => setField("quantity", e.target.value)}
                required
              />
            </label>

            <label>
              Shipping charge (₹)
              <input
                type="number"
                min={0}
                step="1"
                value={form.shipping_charge}
                onChange={(e) => setField("shipping_charge", e.target.value)}
                required
              />
            </label>
          </div>

          <fieldset className={styles.payFieldset}>
            <legend>Payment</legend>
            <div className={styles.payRow}>
              <label className={styles.payOption}>
                <input
                  type="radio"
                  name="payment_type"
                  value="cod"
                  checked={form.payment_type === "cod"}
                  onChange={() => setField("payment_type", "cod")}
                />
                <span>
                  <strong>COD</strong>
                  <small>Customer pays cash on delivery</small>
                </span>
              </label>
              <label className={styles.payOption}>
                <input
                  type="radio"
                  name="payment_type"
                  value="paid"
                  checked={form.payment_type === "paid"}
                  onChange={() => setField("payment_type", "paid")}
                />
                <span>
                  <strong>Paid</strong>
                  <small>Already paid to you manually — no online payment</small>
                </span>
              </label>
            </div>
          </fieldset>

          <h4 className={styles.sectionTitle}>Customer</h4>
          <div className={styles.grid}>
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                required
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                inputMode="tel"
                required
              />
            </label>
            <label className={styles.full}>
              Email (optional)
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </label>
          </div>

          <h4 className={styles.sectionTitle}>Delivery address</h4>
          <div className={styles.grid}>
            <label className={styles.full}>
              Address line 1
              <input
                value={form.line1}
                onChange={(e) => setField("line1", e.target.value)}
                required
              />
            </label>
            <label className={styles.full}>
              Address line 2
              <input
                value={form.line2}
                onChange={(e) => setField("line2", e.target.value)}
              />
            </label>
            <label>
              Landmark
              <input
                value={form.landmark}
                onChange={(e) => setField("landmark", e.target.value)}
              />
            </label>
            <label>
              Pincode
              <input
                value={form.pincode}
                onChange={(e) => setField("pincode", e.target.value)}
                onBlur={handlePincodeBlur}
                maxLength={6}
                required
              />
            </label>
            <label>
              City
              <input
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                required
              />
            </label>
            <label>
              State
              <select
                value={form.state}
                onChange={(e) => setField("state", e.target.value)}
                required
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.summary}>
            <div>
              <span>Subtotal</span>
              <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span>Shipping</span>
              <strong>₹{(Number.isFinite(shipping) ? shipping : 0).toLocaleString("en-IN")}</strong>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? "Placing…" : "Place order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
