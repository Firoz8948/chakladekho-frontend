"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiPlayCircle,
  FiShoppingBag,
  FiShoppingCart,
  FiUser,
} from "react-icons/fi";

import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import styles from "./MobileBottomNav.module.css";

export default function MobileBottomNav({ onProfileClick }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const profileActive =
    pathname.startsWith("/orders") || pathname.startsWith("/checkout");

  return (
    <nav className={styles.bar} aria-label="Mobile primary">
      <Link
        href="/"
        className={`${styles.item} ${isActive("/") ? styles.active : ""}`}
      >
        <FiHome size={22} strokeWidth={2} aria-hidden />
        <span>Home</span>
      </Link>

      <Link
        href="/shop"
        className={`${styles.item} ${isActive("/shop") ? styles.active : ""}`}
      >
        <FiShoppingBag size={22} strokeWidth={2} aria-hidden />
        <span>Shop</span>
      </Link>

      <Link
        href="/reels"
        className={`${styles.item} ${isActive("/reels") ? styles.active : ""}`}
      >
        <FiPlayCircle size={22} strokeWidth={2} aria-hidden />
        <span>Watch&Shop</span>
      </Link>

      <Link
        href="/cart"
        className={`${styles.item} ${isActive("/cart") ? styles.active : ""}`}
        data-cart-target="mobile"
      >
        <span className={styles.iconWrap}>
          <FiShoppingCart size={22} strokeWidth={2} aria-hidden />
          {itemCount > 0 ? (
            <span className={styles.badge}>
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          ) : null}
        </span>
        <span>Cart</span>
      </Link>

      <button
        type="button"
        className={`${styles.item} ${profileActive ? styles.active : ""}`}
        onClick={onProfileClick}
        aria-label={isAuthenticated ? "Profile" : "Sign in"}
      >
        <FiUser size={22} strokeWidth={2} aria-hidden />
        <span>Profile</span>
      </button>
    </nav>
  );
}
