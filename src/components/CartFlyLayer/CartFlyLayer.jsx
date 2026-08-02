"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { mediaUrl } from "@/utils/mediaUrl";
import styles from "./CartFlyLayer.module.css";

export function getCartTargetEl() {
  if (typeof window === "undefined") return null;
  const mobile = window.matchMedia("(max-width: 860px)").matches;
  const selector = mobile
    ? '[data-cart-target="mobile"]'
    : '[data-cart-target="desktop"]';
  return document.querySelector(selector);
}

export function resolveSourceRect(source) {
  if (!source) return null;
  if (typeof source.getBoundingClientRect === "function") {
    return source.getBoundingClientRect();
  }
  if (
    typeof source.left === "number" &&
    typeof source.top === "number" &&
    typeof source.width === "number"
  ) {
    return source;
  }
  return null;
}

export default function CartFlyLayer({ flights = [], onFlightEnd }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div id="movingDisc-root" className={styles.root} aria-hidden="true">
      {flights.map((flight) => {
        const dx = flight.endX - flight.startX;
        const dy = flight.endY - flight.startY;
        const thumb = flight.image ? mediaUrl(flight.image) : "";
        return (
          <div
            key={flight.id}
            className={`${styles.disc} ${styles.discActive}`}
            style={{
              left: flight.startX,
              top: flight.startY,
              ["--dx"]: `${dx}px`,
              ["--dy"]: `${dy}px`,
            }}
            onAnimationEnd={() => onFlightEnd?.(flight.id)}
          >
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="" className={styles.thumb} />
            ) : (
              <span className={styles.dot} />
            )}
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
