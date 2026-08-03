"use client";
import { useEffect, useState } from "react";
import {
  getAdminOrders,
  pushOrderToShipmozo,
  pushOrderToShiprocket,
  updateOrderStatus,
} from "@/services/adminService";
import styles from "./orders.module.css";

const STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS = {
  pending: { bg: "var(--warning-bg)", color: "var(--warning)", border: "var(--warning)" },
  confirmed: { bg: "var(--info-bg)", color: "var(--info)", border: "var(--info)" },
  processing: { bg: "var(--bg-cream)", color: "var(--secondary)", border: "var(--secondary)" },
  shipped: { bg: "var(--success-bg)", color: "var(--success)", border: "var(--success)" },
  delivered: { bg: "var(--success-bg)", color: "var(--success)", border: "var(--success)" },
  cancelled: { bg: "var(--error-bg)", color: "var(--error)", border: "var(--error)" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [shippingOrder, setShippingOrder] = useState(null);
  const [shippingProvider, setShippingProvider] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const LIMIT = 15;

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (statusFilter !== "all") params.status = statusFilter;
    getAdminOrders(params)
      .then((res) => {
        setOrders(res.data.orders);
        setTotal(res.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId ? { ...o, order_status: newStatus } : o
        )
      );
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  const handleShiprocket = async (orderId) => {
    setShippingOrder(orderId);
    setShippingProvider("shiprocket");
    try {
      const res = await pushOrderToShiprocket(orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId ? { ...o, shipment: res.data } : o
        )
      );
      if (!res.data?.shiprocket_order_id) {
        alert(
          "Shiprocket did not create an order. Check pickup location and try again."
        );
        return;
      }
      alert(`Sent to Shiprocket (ID: ${res.data.shiprocket_order_id})`);
    } catch (err) {
      alert(
        err?.response?.data?.detail ||
          err.message ||
          "Failed to send order to Shiprocket"
      );
    } finally {
      setShippingOrder(null);
      setShippingProvider(null);
    }
  };

  const handleShipmozo = async (orderId) => {
    setShippingOrder(orderId);
    setShippingProvider("shipmozo");
    try {
      const res = await pushOrderToShipmozo(orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId ? { ...o, shipment: res.data } : o
        )
      );
      if (!res.data?.shipmozo_reference_id) {
        alert(
          "Shipmozo did not return a reference id. Check warehouse id and API keys."
        );
        return;
      }
      const awb = res.data.awb_code ? ` · AWB: ${res.data.awb_code}` : "";
      alert(`Sent to Shipmozo (Ref: ${res.data.shipmozo_reference_id}${awb})`);
    } catch (err) {
      alert(
        err?.response?.data?.detail ||
          err.message ||
          "Failed to send order to Shipmozo"
      );
    } finally {
      setShippingOrder(null);
      setShippingProvider(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const isBusy = (orderId, provider) =>
    shippingOrder === orderId && shippingProvider === provider;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Orders</h2>
          <p className={styles.subtitle}>{total} total orders</p>
        </div>
      </div>

      <div className={styles.tabs}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`${styles.tab} ${statusFilter === s ? styles.tabActive : ""}`}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loader}>
          <div className={styles.spinner} />
        </div>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📦</div>
          <p>No orders found.</p>
        </div>
      ) : (
        <div className={styles.orderCards}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div
                className={styles.orderTop}
                onClick={() =>
                  setExpanded(expanded === order.id ? null : order.id)
                }
              >
                <div className={styles.orderLeft}>
                  <span className={styles.orderId}>{order.order_id}</span>
                  <span className={styles.orderCustomer}>
                    {order.customer?.name} · {order.customer?.phone}
                  </span>
                </div>

                <div className={styles.orderMeta}>
                  <span
                    className={styles.statusBadge}
                    style={{
                      background: STATUS_COLORS[order.order_status]?.bg,
                      color: STATUS_COLORS[order.order_status]?.color,
                      border: `1px solid ${STATUS_COLORS[order.order_status]?.border}`,
                    }}
                  >
                    {order.order_status}
                  </span>
                  <span className={styles.orderTotal}>
                    ₹{order.total?.toLocaleString("en-IN")}
                  </span>
                  <span className={styles.payMethod}>{order.payment_method}</span>
                  {order.shipment?.shiprocket_order_id ? (
                    <span className={styles.shipBadge}>Shiprocket</span>
                  ) : null}
                  {order.shipment?.shipmozo_reference_id ? (
                    <span className={styles.shipBadgeMozo}>Shipmozo</span>
                  ) : null}
                  <span className={styles.chevron}>
                    {expanded === order.id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {expanded === order.id && (
                <div className={styles.orderDetails}>
                  <div className={styles.itemsTable}>
                    <div className={styles.itemsHead}>
                      <span>Product</span>
                      <span>Qty</span>
                      <span>Price</span>
                      <span>Total</span>
                    </div>
                    {order.items?.map((item, i) => (
                      <div key={i} className={styles.itemRow}>
                        <span>{item.name}</span>
                        <span>{item.quantity}</span>
                        <span>₹{item.price?.toLocaleString("en-IN")}</span>
                        <span>
                          ₹{(item.price * item.quantity)?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                    <div className={styles.itemsFooter}>
                      <span>Shipping</span>
                      <span>₹{order.shipping_charge}</span>
                    </div>
                    <div className={styles.itemsTotal}>
                      <span>Total</span>
                      <span>₹{order.total?.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className={styles.addressBox}>
                    <h4 className={styles.detailTitle}>Delivery Address</h4>
                    <p>
                      {order.address?.line1},{" "}
                      {order.address?.line2 && `${order.address.line2}, `}
                      {order.address?.city}, {order.address?.state} —{" "}
                      {order.address?.pincode}
                    </p>
                  </div>

                  <div className={styles.shipBox}>
                    <h4 className={styles.detailTitle}>Shipping partners</h4>
                    <div className={styles.shipPartner}>
                      <p className={styles.shipInfo}>
                        {order.shipment?.shiprocket_order_id ? (
                          <>
                            Shiprocket: {order.shipment.shiprocket_order_id}
                            {order.shipment.awb_code
                              ? ` · AWB: ${order.shipment.awb_code}`
                              : ""}
                            {order.shipment.courier_name
                              ? ` · ${order.shipment.courier_name}`
                              : ""}
                          </>
                        ) : (
                          "Shiprocket: not sent yet."
                        )}
                      </p>
                      <button
                        type="button"
                        className={styles.shipBtn}
                        disabled={!!shippingOrder}
                        onClick={() => handleShiprocket(order.order_id)}
                      >
                        {isBusy(order.order_id, "shiprocket")
                          ? "Sending…"
                          : order.shipment?.shiprocket_order_id
                            ? "Re-sync Shiprocket"
                            : "Send to Shiprocket"}
                      </button>
                    </div>
                    <div className={styles.shipPartner}>
                      <p className={styles.shipInfo}>
                        {order.shipment?.shipmozo_reference_id ? (
                          <>
                            Shipmozo: {order.shipment.shipmozo_reference_id}
                            {order.shipment.awb_code
                              ? ` · AWB: ${order.shipment.awb_code}`
                              : ""}
                            {order.shipment.courier_name
                              ? ` · ${order.shipment.courier_name}`
                              : ""}
                          </>
                        ) : (
                          "Shipmozo: not sent yet."
                        )}
                      </p>
                      <button
                        type="button"
                        className={styles.shipBtnMozo}
                        disabled={!!shippingOrder}
                        onClick={() => handleShipmozo(order.order_id)}
                      >
                        {isBusy(order.order_id, "shipmozo")
                          ? "Sending…"
                          : order.shipment?.shipmozo_reference_id
                            ? "Re-sync Shipmozo"
                            : "Send to Shipmozo"}
                      </button>
                    </div>
                  </div>

                  <div className={styles.statusUpdate}>
                    <h4 className={styles.detailTitle}>Update Status</h4>
                    <div className={styles.statusBtns}>
                      {[
                        "confirmed",
                        "processing",
                        "shipped",
                        "delivered",
                        "cancelled",
                      ].map((s) => (
                        <button
                          key={s}
                          className={`${styles.statusBtn} ${
                            order.order_status === s ? styles.statusBtnActive : ""
                          }`}
                          style={
                            order.order_status === s
                              ? {
                                  background: STATUS_COLORS[s]?.bg,
                                  color: STATUS_COLORS[s]?.color,
                                  borderColor: STATUS_COLORS[s]?.border,
                                }
                              : {}
                          }
                          disabled={
                            order.order_status === s ||
                            updating === order.order_id
                          }
                          onClick={() => handleStatusUpdate(order.order_id, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Prev
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
