"use client";

import { formatDate, formatPrice } from "@/utils/formatPrice";
import styles from "./OrderTable.module.css";

export default function OrderTable({ orders = [], onView }) {
  if (!orders.length) {
    return <p className="text-muted">No orders found.</p>;
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Coupon</th>
            <th>Date</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} onClick={() => onView(o)} className={styles.row}>
              <td>#{o.order_id || o.order_number}</td>
              <td>{o.customer?.name || o.shipping_address?.full_name || "—"}</td>
              <td>{o.promo_code || "—"}</td>
              <td>{formatDate(o.created_at)}</td>
              <td>{formatPrice(o.total ?? o.total_amount)}</td>
              <td>
                <span className={styles.payment}>{o.payment_status}</span>
              </td>
              <td>
                <span className={styles.status}>{o.order_status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
