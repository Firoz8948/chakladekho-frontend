"use client";

import { ORDER_STATUS } from "@/utils/constants";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./OrderDetail.module.css";

export default function OrderDetail({ order, onStatusChange, updating }) {
  if (!order) return null;
  const addr = order.address || order.shipping_address || {};
  const customer = order.customer || {};

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <h4>Items</h4>
        {order.items.map((item, i) => (
          <div key={i} className={styles.item}>
            <span>
              {item.name} × {item.qty || item.quantity}
            </span>
            <span>{formatPrice(item.price * (item.qty || item.quantity))}</span>
          </div>
        ))}
        <div className={styles.total}>
          <span>Total</span>
          <span>{formatPrice(order.total ?? order.total_amount)}</span>
        </div>
        {order.promo_code ? (
          <p className={styles.promoLine}>
            Coupon: <strong>{order.promo_code}</strong>
            {order.discount_amount
              ? ` (−${formatPrice(order.discount_amount)})`
              : ""}
          </p>
        ) : null}
      </div>

      <div className={styles.section}>
        <h4>Customer</h4>
        <p>{customer.name || addr.full_name}</p>
        <p>{customer.mobile || addr.phone}</p>
        {customer.email ? <p>{customer.email}</p> : null}
      </div>

      <div className={styles.section}>
        <h4>Shipping Address</h4>
        <p>
          {addr.line1}
          {addr.line2 ? `, ${addr.line2}` : ""}
        </p>
        <p>
          {addr.city}, {addr.state} - {addr.pincode}
        </p>
        <p>{addr.country}</p>
      </div>

      <div className={styles.section}>
        <h4>Update Status</h4>
        <select
          value={order.order_status}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={updating}
        >
          {ORDER_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
