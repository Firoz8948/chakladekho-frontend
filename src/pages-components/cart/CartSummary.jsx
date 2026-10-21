"use client";

import { useRouter } from "next/navigation";

import Button from "@/components/Button/Button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_CHARGE } from "@/utils/constants";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./CartSummary.module.css";

export default function CartSummary() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const subtotal = cart.total_amount;
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal <= 0 ? 0 : FLAT_SHIPPING_CHARGE;
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className={styles.summary}>
      <h3>Order Summary</h3>

      <div className={styles.row}>
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className={styles.row}>
        <span>Shipping</span>
        <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
      </div>

      {remaining > 0 && (
        <p className={styles.hint}>
          Add {formatPrice(remaining)} more for free shipping!
        </p>
      )}

      <div className={`${styles.row} ${styles.total}`}>
        <span>
          Total <span className={styles.taxNote}>(GST incl.)</span>
        </span>
        <span>{formatPrice(total)}</span>
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={handleCheckout}
        disabled={cart.items.length === 0}
      >
        {isAuthenticated ? "Proceed to Checkout" : "Sign In to Checkout"}
      </Button>
      <button className={styles.clear} onClick={clearCart}>
        Clear Cart
      </button>
    </div>
  );
}
