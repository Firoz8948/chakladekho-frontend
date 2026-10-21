"use client";

import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiGift, FiPackage } from "react-icons/fi";

import { useCart } from "@/hooks/useCart";
import { useFreeGift } from "@/hooks/useFreeGift";
import { quoteShipping, validatePromoCode } from "@/services/bannerService";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_CHARGE } from "@/utils/constants";
import { formatPrice } from "@/utils/formatPrice";
import { mediaUrl } from "@/utils/mediaUrl";
import styles from "./OrderSummary.module.css";

const BOX_MAX_THUMBS = 4;

function OrderBox({ items, gift }) {
  const shown = items.slice(0, BOX_MAX_THUMBS);
  const hidden = items.length - shown.length;
  const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const parts = shown.map((item) => (
    <div key={item.item_id} className={styles.boxThumb}>
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(item.image)} alt={item.name} />
      ) : (
        <FiPackage aria-hidden="true" />
      )}
      {item.quantity > 1 ? (
        <span className={styles.boxQty}>×{item.quantity}</span>
      ) : null}
    </div>
  ));
  if (hidden > 0) {
    parts.push(
      <div key="more" className={`${styles.boxThumb} ${styles.boxMore}`}>
        +{hidden}
      </div>,
    );
  }
  if (gift) {
    parts.push(
      <div key="gift" className={`${styles.boxThumb} ${styles.boxGift}`}>
        {gift.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(gift.image_url)} alt={gift.title} />
        ) : (
          <FiGift aria-hidden="true" />
        )}
        <span className={styles.boxFreeTag}>FREE</span>
      </div>,
    );
  }

  return (
    <div className={styles.box}>
      <p className={styles.boxTitle}>
        <FiPackage aria-hidden="true" /> Your box
      </p>
      <div className={styles.boxRow}>
        {parts.map((part, i) => (
          <Fragment key={part.key}>
            {i > 0 ? (
              <span className={styles.boxOp} aria-hidden="true">
                +
              </span>
            ) : null}
            {part}
          </Fragment>
        ))}
        <span className={styles.boxOp} aria-hidden="true">
          =
        </span>
        <div className={styles.boxResult} aria-hidden="true">
          <FiPackage />
        </div>
      </div>
      <p className={styles.boxCaption}>
        {totalQty} item{totalQty === 1 ? "" : "s"}
        {gift ? (
          <>
            {" "}
            + <strong>{gift.title}</strong>
          </>
        ) : null}{" "}
        packed together in one box
      </p>
    </div>
  );
}

export default function OrderSummary({
  promo,
  onPromoChange,
  pincode = "",
  state = "",
  phone = "",
  paymentMethod = "razorpay",
  onShippingQuoteChange,
}) {
  const { cart } = useCart();
  const gift = useFreeGift();
  const subtotal = cart.total_amount;

  const [codeInput, setCodeInput] = useState(promo?.code || "");
  const [applying, setApplying] = useState(false);
  const [zoneQuote, setZoneQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const pin = String(pincode || "").replace(/\D/g, "");
    const hasLocation = (state && state.trim()) || pin.length === 6;

    if (!hasLocation || subtotal <= 0) {
      setZoneQuote(null);
      onShippingQuoteChange?.(null);
      return;
    }

    const timer = setTimeout(async () => {
      setQuoting(true);
      try {
        // One quote returns both prepaid + COD charges; payment method only picks which to show
        const res = await quoteShipping({
          subtotal,
          state: state || null,
          pincode: pin.length === 6 ? pin : null,
          payment_method: "prepaid",
        });
        if (!cancelled) {
          setZoneQuote(res.data);
          onShippingQuoteChange?.(res.data);
        }
      } catch {
        if (!cancelled) {
          setZoneQuote(null);
          onShippingQuoteChange?.(null);
        }
      } finally {
        if (!cancelled) setQuoting(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pincode, state, subtotal, onShippingQuoteChange]);

  const fallbackShipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal <= 0 ? 0 : FLAT_SHIPPING_CHARGE;

  const prepaidShipping =
    zoneQuote?.prepaid_shipping_charge != null
      ? zoneQuote.prepaid_shipping_charge
      : zoneQuote?.prepaid_rate != null
        ? subtotal >= (zoneQuote.free_shipping_threshold ?? FREE_SHIPPING_THRESHOLD)
          ? 0
          : zoneQuote.prepaid_rate
        : fallbackShipping;

  const codShipping =
    zoneQuote?.cod_shipping_charge != null
      ? zoneQuote.cod_shipping_charge
      : zoneQuote?.cod_rate != null
        ? subtotal >= (zoneQuote.free_shipping_threshold ?? FREE_SHIPPING_THRESHOLD)
          ? 0
          : zoneQuote.cod_rate
        : fallbackShipping;

  const baseShipping = paymentMethod === "cod" ? codShipping : prepaidShipping;

  const shipping =
    promo?.shipping_charge != null ? promo.shipping_charge : baseShipping;
  const discount = promo?.discount_amount || 0;
  const total = Math.max(subtotal - discount, 0) + shipping;

  const handleApply = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) {
      toast.error("Enter a promo code");
      return;
    }
    setApplying(true);
    try {
      const res = await validatePromoCode({
        code,
        subtotal,
        shipping_charge: baseShipping,
        phone: phone || undefined,
      });
      onPromoChange?.(res.data);
      toast.success(res.data.message || "Promo applied");
    } catch (err) {
      onPromoChange?.(null);
      toast.error(
        err?.response?.data?.detail || err.message || "Invalid promo code"
      );
    } finally {
      setApplying(false);
    }
  };

  const handleRemove = () => {
    setCodeInput("");
    onPromoChange?.(null);
  };

  useEffect(() => {
    if (promo?.code) {
      onPromoChange?.(null);
      setCodeInput("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneQuote?.zone_id, zoneQuote?.prepaid_rate, zoneQuote?.cod_rate]);

  useEffect(() => {
    // Shipping amount depends on payment method — drop promo so totals stay correct
    if (promo?.code) {
      onPromoChange?.(null);
      setCodeInput("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod]);

  return (
    <div className={styles.wrap}>
      <h3>Order Summary</h3>
      <div className={styles.items}>
        {cart.items.map((item) => (
          <div key={item.item_id} className={styles.item}>
            <span className={styles.name}>
              {item.name} <em>× {item.quantity}</em>
            </span>
            <span>{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        {gift && cart.items.length > 0 ? (
          <div className={styles.item}>
            <span className={styles.name}>
              {gift.title} <em>× 1</em>
            </span>
            <span className={styles.freeText}>FREE</span>
          </div>
        ) : null}
      </div>

      {cart.items.length > 0 ? (
        <OrderBox items={cart.items} gift={gift} />
      ) : null}

      <div className={styles.promoBox}>
        <label htmlFor="promo-code">Promo code</label>
        <div className={styles.promoRow}>
          <input
            id="promo-code"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder=""
            disabled={!!promo}
          />
          {promo ? (
            <button type="button" onClick={handleRemove}>
              Remove
            </button>
          ) : (
            <button type="button" onClick={handleApply} disabled={applying}>
              {applying ? "…" : "Apply"}
            </button>
          )}
        </div>
        {promo && (
          <p className={styles.promoOk}>
            Applied: {promo.action_label || promo.code}
          </p>
        )}
      </div>

      <div className={styles.row}>
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className={styles.row}>
          <span>Discount</span>
          <span>-{formatPrice(discount)}</span>
        </div>
      )}
      <div className={styles.row}>
        <span>Shipping</span>
        <span>
          {quoting
            ? "…"
            : shipping === 0
              ? "Free"
              : formatPrice(shipping)}
        </span>
      </div>
      {zoneQuote?.zone_name && !quoting && (
        <p className={styles.zoneNote}>
          Via {zoneQuote.zone_name}
          {zoneQuote.state ? ` · ${zoneQuote.state}` : ""}
        </p>
      )}
      {!zoneQuote && !quoting && !(state || String(pincode).length === 6) && (
        <p className={styles.zoneNote}>Enter pincode to see zone shipping</p>
      )}

      {paymentMethod === "cod" &&
        !quoting &&
        prepaidShipping !== codShipping && (
          <p className={styles.switchHint}>
            Choose <strong>Pay Online</strong> and get shipping for{" "}
            <strong>
              {prepaidShipping === 0 ? "Free" : formatPrice(prepaidShipping)}
            </strong>
            {codShipping > prepaidShipping
              ? ` (save ${formatPrice(codShipping - prepaidShipping)})`
              : ""}
          </p>
        )}

      <div className={`${styles.row} ${styles.total}`}>
        <span>
          Total <span className={styles.taxNote}>(GST incl.)</span>
        </span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
