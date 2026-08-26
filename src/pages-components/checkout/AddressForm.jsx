"use client";

import { useState } from "react";

import { INDIAN_STATES, lookupPincode } from "@/utils/indiaAddress";
import styles from "./AddressForm.module.css";

function FieldError({ message }) {
  if (!message) return null;
  return <span className={styles.error}>{message}</span>;
}

export default function AddressForm({
  address,
  onChange,
  phoneReadOnly = false,
  onAddNewAddress,
  errors = {},
  onClearError,
}) {
  const [pinHint, setPinHint] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  const clear = (name) => {
    if (onClearError) onClearError(name);
  };

  const handleChange = (e) => {
    clear(e.target.name);
    onChange({ ...address, [e.target.name]: e.target.value });
  };

  const handlePincode = async (value) => {
    const pin = value.replace(/\D/g, "").slice(0, 6);
    clear("pincode");
    clear("city");
    clear("state");
    onChange({ ...address, pincode: pin });
    setPinHint("");
    if (pin.length !== 6) {
      if (pin.length > 0) {
        setPinHint("Enter a valid 6-digit pin code");
      }
      return;
    }

    setPinLoading(true);
    const result = await lookupPincode(pin);
    setPinLoading(false);
    if (!result.ok) {
      setPinHint(result.error || "Pincode not found");
      return;
    }
    onChange({
      ...address,
      pincode: result.pincode,
      city: result.city || address.city,
      state: result.state || address.state,
    });
    setPinHint(`Filled: ${result.city}, ${result.state}`);
  };

  const inputClass = (name) => (errors[name] ? styles.invalid : undefined);

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h3>Shipping Details</h3>
        {onAddNewAddress ? (
          <button
            type="button"
            className={styles.addNewBtn}
            onClick={onAddNewAddress}
          >
            + Add new address
          </button>
        ) : null}
      </div>

      <div className={styles.grid}>
        <div>
          <label>Full Name</label>
          <input
            name="full_name"
            placeholder="Enter full name"
            value={address.full_name || ""}
            onChange={handleChange}
            className={inputClass("full_name")}
            aria-invalid={!!errors.full_name}
          />
          <FieldError message={errors.full_name} />
        </div>
        <div>
          <label>Mobile</label>
          <input
            name="phone"
            placeholder="10-digit mobile"
            value={address.phone || ""}
            onChange={handleChange}
            readOnly={phoneReadOnly}
            disabled={phoneReadOnly}
            className={inputClass("phone")}
            aria-invalid={!!errors.phone}
          />
          <FieldError message={errors.phone} />
        </div>

        <div className={styles.full}>
          <label>Email (optional)</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={address.email || ""}
            onChange={handleChange}
            className={inputClass("email")}
            aria-invalid={!!errors.email}
          />
          <FieldError message={errors.email} />
        </div>

        <div className={styles.full}>
          <label>Address Line 1</label>
          <input
            name="line1"
            placeholder="House / flat / building"
            value={address.line1 || ""}
            onChange={handleChange}
            className={inputClass("line1")}
            aria-invalid={!!errors.line1}
          />
          <FieldError message={errors.line1} />
        </div>

        <div className={styles.full}>
          <label>Address Line 2</label>
          <input
            name="line2"
            placeholder="Street / area (optional)"
            value={address.line2 || ""}
            onChange={handleChange}
          />
        </div>

        <div className={styles.full}>
          <label>Landmark</label>
          <input
            name="landmark"
            placeholder="Nearby landmark (optional)"
            value={address.landmark || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Pin Code</label>
          <input
            name="pincode"
            placeholder="6-digit pin code"
            inputMode="numeric"
            maxLength={6}
            value={address.pincode || ""}
            onChange={(e) => handlePincode(e.target.value)}
            className={inputClass("pincode")}
            aria-invalid={!!errors.pincode}
          />
          <FieldError message={errors.pincode} />
          {!errors.pincode &&
            (pinLoading ? (
              <span className={styles.hint}>Looking up city &amp; state…</span>
            ) : pinHint ? (
              <span
                className={
                  pinHint.startsWith("Filled") ? styles.hint : styles.error
                }
              >
                {pinHint}
              </span>
            ) : null)}
        </div>

        <div>
          <label>City</label>
          <input
            name="city"
            placeholder="City"
            value={address.city || ""}
            onChange={handleChange}
            className={inputClass("city")}
            aria-invalid={!!errors.city}
          />
          <FieldError message={errors.city} />
        </div>

        <div className={styles.full}>
          <label>State</label>
          <select
            name="state"
            value={address.state || ""}
            onChange={handleChange}
            className={inputClass("state")}
            aria-invalid={!!errors.state}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <FieldError message={errors.state} />
        </div>
      </div>
    </div>
  );
}
