"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  createShippingZone,
  deleteShippingZone,
  getAdminShippingZones,
  updateShippingZone,
} from "@/services/adminService";
import { INDIAN_STATES } from "@/utils/indiaAddress";
import styles from "./settings.module.css";

const emptyForm = {
  name: "",
  is_all_india: false,
  states: [],
  prepaid_rate: 0,
  cod_rate: 0,
  free_shipping_threshold: 0,
  is_active: true,
};

export default function AdminSettingsPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAdminShippingZones();
      setZones(res.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.detail || e.message || "Failed to load zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleState = (state) => {
    setForm((prev) => {
      const has = prev.states.includes(state);
      return {
        ...prev,
        states: has
          ? prev.states.filter((s) => s !== state)
          : [...prev.states, state],
      };
    });
  };

  const selectAllStates = () => {
    setForm((prev) => ({ ...prev, states: [...INDIAN_STATES], is_all_india: false }));
  };

  const clearStates = () => {
    setForm((prev) => ({ ...prev, states: [] }));
  };

  const handleEdit = (zone) => {
    setEditingId(zone.id);
    setForm({
      name: zone.name,
      is_all_india: !!zone.is_all_india,
      states: zone.states || [],
      prepaid_rate:
        zone.prepaid_rate != null ? zone.prepaid_rate : zone.rate ?? 0,
      cod_rate:
        zone.cod_rate != null
          ? zone.cod_rate
          : zone.prepaid_rate ?? zone.rate ?? 0,
      free_shipping_threshold:
        zone.free_shipping_threshold != null ? zone.free_shipping_threshold : 0,
      is_active: zone.is_active,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Enter a zone name");
      return;
    }
    if (!form.is_all_india && form.states.length === 0) {
      toast.error("Select states or choose All over India");
      return;
    }

    const payload = {
      name: form.name.trim(),
      is_all_india: form.is_all_india,
      states: form.is_all_india ? [] : form.states,
      prepaid_rate: Number(form.prepaid_rate),
      cod_rate: Number(form.cod_rate),
      rate: Number(form.prepaid_rate),
      free_shipping_threshold:
        form.free_shipping_threshold === "" || form.free_shipping_threshold == null
          ? null
          : Number(form.free_shipping_threshold),
      is_active: form.is_active,
      position: editingId
        ? zones.find((z) => z.id === editingId)?.position || 0
        : zones.length,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateShippingZone(editingId, payload);
        toast.success("Zone updated");
      } else {
        await createShippingZone(payload);
        toast.success("Zone created");
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (zone) => {
    if (!confirm(`Delete "${zone.name}"?`)) return;
    try {
      await deleteShippingZone(zone.id);
      toast.success("Zone deleted");
      if (editingId === zone.id) resetForm();
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || e.message || "Failed to delete");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Settings</h2>
          <p className={styles.subtitle}>
            Create shipping zones with states (or all India) and set separate
            rates for prepaid and COD. Use 0 for free shipping. Checkout picks
            the zone from pincode/state and applies the rate for the selected
            payment method. Current live zone is Pan India at ₹0 prepaid and ₹0 COD.
          </p>
        </div>
      </div>

      <section className={styles.card}>
        <h3>Shipping zones</h3>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label>
              Zone name
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Zone 1"
                required
              />
            </label>
            <label>
              Prepaid order — shipping (₹)
              <input
                type="number"
                min={0}
                step="1"
                value={form.prepaid_rate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, prepaid_rate: e.target.value }))
                }
                placeholder="0"
                required
              />
            </label>
            <label>
              COD order — shipping (₹)
              <input
                type="number"
                min={0}
                step="1"
                value={form.cod_rate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cod_rate: e.target.value }))
                }
                placeholder="0"
                required
              />
            </label>
            <label>
              Free shipping above (₹)
              <input
                type="number"
                min={0}
                step="1"
                value={form.free_shipping_threshold ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    free_shipping_threshold: e.target.value,
                  }))
                }
                placeholder="0"
              />
            </label>
          </div>

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={form.is_all_india}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  is_all_india: e.target.checked,
                  states: e.target.checked ? [] : p.states,
                }))
              }
            />
            All over India (fallback zone for any state not listed elsewhere)
          </label>

          {!form.is_all_india && (
            <div className={styles.statesBlock}>
              <div className={styles.statesHead}>
                <span>Select states</span>
                <div className={styles.statesTools}>
                  <button type="button" onClick={selectAllStates}>
                    Select all
                  </button>
                  <button type="button" onClick={clearStates}>
                    Clear
                  </button>
                </div>
              </div>
              <div className={styles.statesGrid}>
                {INDIAN_STATES.map((state) => (
                  <label key={state} className={styles.stateChip}>
                    <input
                      type="checkbox"
                      checked={form.states.includes(state)}
                      onChange={() => toggleState(state)}
                    />
                    {state}
                  </label>
                ))}
              </div>
              <p className={styles.hint}>
                {form.states.length} state{form.states.length === 1 ? "" : "s"}{" "}
                selected
              </p>
            </div>
          )}

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((p) => ({ ...p, is_active: e.target.checked }))
              }
            />
            Active
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving
                ? "Saving…"
                : editingId
                  ? "Update Zone"
                  : "+ Add Zone"}
            </button>
            {editingId && (
              <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className={styles.card}>
        <h3>Configured zones</h3>
        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : zones.length === 0 ? (
          <p className={styles.muted}>
            No zones yet. Add Zone 1 with states, then Zone 2 as All over India.
          </p>
        ) : (
          <div className={styles.list}>
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={`${styles.zoneCard} ${
                  !zone.is_active ? styles.inactive : ""
                }`}
              >
                <div className={styles.zoneTop}>
                  <div>
                    <strong>{zone.name}</strong>
                    <span className={styles.badge}>
                      {zone.is_all_india
                        ? "All over India"
                        : `${(zone.states || []).length} states`}
                    </span>
                  </div>
                  <div className={styles.rate}>
                    <span>Prepaid ₹{zone.prepaid_rate ?? zone.rate}</span>
                    <span>COD ₹{zone.cod_rate ?? zone.rate}</span>
                  </div>
                </div>
                <p className={styles.zoneMeta}>
                  Free above ₹
                  {zone.free_shipping_threshold != null
                    ? zone.free_shipping_threshold
                    : 999}{" "}
                  · {zone.is_active ? "Active" : "Inactive"}
                </p>
                {!zone.is_all_india && (
                  <p className={styles.statesPreview}>
                    {(zone.states || []).join(", ") || "No states"}
                  </p>
                )}
                <div className={styles.zoneActions}>
                  <button type="button" onClick={() => handleEdit(zone)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.danger}
                    onClick={() => handleDelete(zone)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
