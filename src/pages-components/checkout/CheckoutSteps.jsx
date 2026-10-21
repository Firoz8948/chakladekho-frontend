"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiEdit2, FiMapPin } from "react-icons/fi";

import Button from "@/components/Button/Button";
import { INDIAN_STATES, lookupPincode } from "@/utils/indiaAddress";
import styles from "./CheckoutSteps.module.css";

export const CHECKOUT_STEPS = [
  { id: 1, label: "Contact", fields: ["full_name", "phone", "email"] },
  { id: 2, label: "Pincode", fields: ["pincode", "city", "state"] },
  { id: 3, label: "Address", fields: ["line1", "landmark"] },
  { id: 4, label: "Payment", fields: [] },
];

function FieldError({ message }) {
  if (!message) return null;
  return <span className={styles.error}>{message}</span>;
}

export function CheckoutProgress({ step, maxStep, onStepClick }) {
  return (
    <ol className={styles.progress} aria-label="Checkout progress">
      {CHECKOUT_STEPS.map((s, i) => {
        const done = s.id < step;
        const current = s.id === step;
        const reachable = s.id <= maxStep && !current;
        return (
          <li
            key={s.id}
            className={`${styles.progressItem} ${done ? styles.done : ""} ${current ? styles.current : ""}`}
            aria-current={current ? "step" : undefined}
          >
            {i > 0 ? <span className={styles.progressLine} aria-hidden="true" /> : null}
            <button
              type="button"
              className={styles.progressDot}
              onClick={() => reachable && onStepClick(s.id)}
              disabled={!reachable}
              aria-label={`Step ${s.id}: ${s.label}`}
            >
              {done ? <FiCheck aria-hidden="true" /> : s.id}
            </button>
            <span className={styles.progressLabel}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function useFieldHelpers(form, onChange, errors, onClearError) {
  const handle = (e) => {
    onClearError?.(e.target.name);
    onChange({ ...form, [e.target.name]: e.target.value });
  };
  const cls = (name) => (errors[name] ? styles.invalid : undefined);
  return { handle, cls };
}

export function ContactStep({ form, onChange, errors, onClearError, onNext }) {
  const { handle, cls } = useFieldHelpers(form, onChange, errors, onClearError);
  return (
    <form
      className={styles.card}
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      noValidate
    >
      <h3 className={styles.cardTitle}>Contact details</h3>
      <div className={styles.grid}>
        <div className={styles.full}>
          <label htmlFor="co-name">Full name</label>
          <input
            id="co-name"
            name="full_name"
            placeholder="Enter your full name"
            value={form.full_name || ""}
            onChange={handle}
            className={cls("full_name")}
            aria-invalid={!!errors.full_name}
            autoComplete="name"
            autoFocus={!form.full_name}
          />
          <FieldError message={errors.full_name} />
        </div>
        <div>
          <label htmlFor="co-phone">Mobile number</label>
          <input
            id="co-phone"
            name="phone"
            value={form.phone ? `+91 ${form.phone}` : ""}
            readOnly
            disabled
          />
          <span className={styles.hint}>Verified at sign in</span>
        </div>
        <div>
          <label htmlFor="co-email">Email (optional)</label>
          <input
            id="co-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email || ""}
            onChange={handle}
            className={cls("email")}
            aria-invalid={!!errors.email}
            autoComplete="email"
          />
          <FieldError message={errors.email} />
        </div>
      </div>
      <Button type="submit" fullWidth size="lg">
        Continue
      </Button>
    </form>
  );
}

export function PincodeStep({ form, onChange, errors, onClearError, onNext }) {
  const { handle, cls } = useFieldHelpers(form, onChange, errors, onClearError);
  const [status, setStatus] = useState("idle");
  const requestRef = useRef(0);
  const formRef = useRef(form);
  formRef.current = form;

  const pin = String(form.pincode || "");

  useEffect(() => {
    if (pin.length !== 6) {
      setStatus("idle");
      return;
    }
    const id = ++requestRef.current;
    setStatus("loading");
    lookupPincode(pin).then((result) => {
      if (id !== requestRef.current) return;
      if (!result.ok) {
        setStatus("notfound");
        return;
      }
      setStatus("found");
      onClearError?.("city");
      onClearError?.("state");
      onChange({
        ...formRef.current,
        city: result.city || formRef.current.city,
        state: result.state || formRef.current.state,
      });
    });
    // Only re-run when the pin itself changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handlePin = (e) => {
    onClearError?.("pincode");
    onChange({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) });
  };

  const showLocation = pin.length === 6 || form.city || form.state;

  return (
    <form
      className={styles.card}
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      noValidate
    >
      <h3 className={styles.cardTitle}>Delivery pin code</h3>
      <div className={styles.grid}>
        <div className={styles.full}>
          <label htmlFor="co-pin">Pin code</label>
          <input
            id="co-pin"
            name="pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder="6-digit pin code"
            value={pin}
            onChange={handlePin}
            className={`${styles.pinInput} ${cls("pincode") || ""}`}
            aria-invalid={!!errors.pincode}
            autoFocus
          />
          <FieldError message={errors.pincode} />
          {!errors.pincode && status === "loading" ? (
            <span className={styles.hint}>Finding your city and state…</span>
          ) : null}
          {status === "found" && form.city && form.state ? (
            <span className={styles.found}>
              <FiMapPin aria-hidden="true" /> Delivering to {form.city}, {form.state}
            </span>
          ) : null}
          {status === "notfound" ? (
            <span className={styles.error}>
              We couldn&apos;t find this pin code. Please enter city and state below.
            </span>
          ) : null}
        </div>

        {showLocation ? (
          <>
            <div>
              <label htmlFor="co-city">City</label>
              <input
                id="co-city"
                name="city"
                placeholder="City"
                value={form.city || ""}
                onChange={handle}
                className={cls("city")}
                aria-invalid={!!errors.city}
                autoComplete="address-level2"
              />
              <FieldError message={errors.city} />
            </div>
            <div>
              <label htmlFor="co-state">State</label>
              <select
                id="co-state"
                name="state"
                value={form.state || ""}
                onChange={handle}
                className={cls("state")}
                aria-invalid={!!errors.state}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <FieldError message={errors.state} />
            </div>
          </>
        ) : null}
      </div>
      <Button type="submit" fullWidth size="lg" disabled={status === "loading"}>
        Confirm &amp; continue
      </Button>
    </form>
  );
}

export function AddressStep({ form, onChange, errors, onClearError, onNext }) {
  const { handle, cls } = useFieldHelpers(form, onChange, errors, onClearError);
  return (
    <form
      className={styles.card}
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      noValidate
    >
      <h3 className={styles.cardTitle}>Delivery address</h3>
      <p className={styles.cardSub}>
        {form.city}, {form.state} – {form.pincode}
      </p>
      <div className={styles.grid}>
        <div className={styles.full}>
          <label htmlFor="co-line1">Address</label>
          <textarea
            id="co-line1"
            name="line1"
            rows={3}
            placeholder="House / flat no., building, street, area"
            value={form.line1 || ""}
            onChange={handle}
            className={cls("line1")}
            aria-invalid={!!errors.line1}
            autoComplete="street-address"
            autoFocus={!form.line1}
          />
          <FieldError message={errors.line1} />
        </div>
        <div className={styles.full}>
          <label htmlFor="co-landmark">Landmark (optional)</label>
          <input
            id="co-landmark"
            name="landmark"
            placeholder="Nearby landmark"
            value={form.landmark || ""}
            onChange={handle}
          />
        </div>
      </div>
      <Button type="submit" fullWidth size="lg">
        Proceed to payment
      </Button>
    </form>
  );
}

export function DeliveryCard({ form, onEditContact, onEditAddress, onNewAddress }) {
  const addressLines = [form.line1, form.line2, form.landmark && `Landmark: ${form.landmark}`]
    .map((v) => String(v || "").trim())
    .filter(Boolean);
  return (
    <div className={styles.card}>
      <div className={styles.deliverHead}>
        <h3 className={styles.cardTitle}>Delivering to</h3>
        <button type="button" className={styles.editBtn} onClick={onEditAddress}>
          <FiEdit2 aria-hidden="true" /> Edit
        </button>
      </div>
      <div className={styles.deliverBody}>
        <p className={styles.deliverName}>
          {form.full_name} · +91 {form.phone}
          <button type="button" className={styles.linkBtn} onClick={onEditContact}>
            Change
          </button>
        </p>
        {form.email ? <p className={styles.deliverMuted}>{form.email}</p> : null}
        {addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p>
          {form.city}, {form.state} – {form.pincode}
        </p>
      </div>
      {onNewAddress ? (
        <button type="button" className={styles.linkBtn} onClick={onNewAddress}>
          + Deliver to a different address
        </button>
      ) : null}
    </div>
  );
}
