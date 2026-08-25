"use client";

import { FiCreditCard, FiDollarSign } from "react-icons/fi";

import Button from "@/components/Button/Button";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./PaymentSection.module.css";

function shippingLabel(amount) {
  if (amount == null) return null;
  if (amount === 0) return "Free shipping";
  return `${formatPrice(amount)} shipping`;
}

export default function PaymentSection({
  method,
  onChange,
  onPlaceOrder,
  loading,
  prepaidShipping = null,
  codShipping = null,
}) {
  const methods = [
    {
      value: "payu",
      label: "Pay Online",
      desc: "Cards, UPI, Netbanking & Wallets (PayU)",
      icon: FiCreditCard,
      shipping: prepaidShipping,
    },
    {
      value: "cod",
      label: "Cash on Delivery",
      desc: "Pay when your order arrives",
      icon: FiDollarSign,
      shipping: codShipping,
    },
  ];

  return (
    <div className={styles.wrap}>
      <h3>Payment Method</h3>
      <div className={styles.options}>
        {methods.map(({ value, label, desc, icon: Icon, shipping }) => (
          <label
            key={value}
            className={`${styles.option} ${method === value ? styles.active : ""}`}
          >
            <input
              type="radio"
              name="payment"
              value={value}
              checked={method === value}
              onChange={() => onChange(value)}
            />
            <Icon size={22} />
            <div className={styles.optionBody}>
              <div className={styles.optionTop}>
                <strong>{label}</strong>
                {shipping != null && (
                  <span className={styles.shipBadge}>{shippingLabel(shipping)}</span>
                )}
              </div>
              <span className={styles.desc}>{desc}</span>
            </div>
          </label>
        ))}
      </div>

      <Button fullWidth size="lg" loading={loading} onClick={onPlaceOrder}>
        Place Order
      </Button>
    </div>
  );
}
