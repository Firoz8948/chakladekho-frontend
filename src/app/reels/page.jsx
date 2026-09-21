"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FiChevronUp, FiShare2, FiShoppingCart, FiX } from "react-icons/fi";

import BuyNowModal, { useBuyNow } from "@/components/BuyNowModal/BuyNowModal";
import { ProductImages, ProductMetafields } from "@/pages-components/product";
import { useCart } from "@/hooks/useCart";
import { calcDiscount, formatPrice } from "@/utils/formatPrice";
import { mediaUrl } from "@/utils/mediaUrl";
import { shareLink, videoShareUrl } from "@/utils/share";
import {
  fetchVideoProducts,
  toCartProduct,
  videoCartOptions,
} from "@/utils/videoProduct";
import styles from "./reels.module.css";
import metafieldStyles from "@/pages-components/product/ProductMetafields.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function handleShare(item) {
  const res = await shareLink({
    title: item.name,
    text: `Check out ${item.name} on ChaklaDekho`,
    url: videoShareUrl(item.id),
  });
  if (res.method === "clipboard") toast.success("Link copied");
  else if (res.method === "failed") toast.error("Could not share");
}

export default function ReelsPage() {
  return (
    <Suspense fallback={<div className={styles.page} />}>
      <ReelsContent />
    </Suspense>
  );
}

function ReelsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const buyNow = useBuyNow();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  const containerRef = useRef(null);
  const slideRefs = useRef([]);
  const videoRefs = useRef([]);
  const appliedDeepLink = useRef(false);

  useEffect(() => {
    fetchVideoProducts()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  // Deep link: jump to the requested video once on load.
  useEffect(() => {
    if (appliedDeepLink.current) return;
    if (!items.length || !containerRef.current) return;
    appliedDeepLink.current = true;

    const vParam = searchParams.get("v");
    if (!vParam) return;
    const idx = items.findIndex((it) => String(it.id) === String(vParam));
    if (idx > 0) {
      containerRef.current.scrollTo({ top: idx * containerRef.current.clientHeight });
      setActiveIndex(idx);
    }
  }, [items, searchParams]);

  // Autoplay the video in view, pause the rest; keep the URL in sync.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !items.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.dataset.index);
          const video = videoRefs.current[idx];
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActiveIndex(idx);
            if (video) video.play().catch(() => {});
            const id = items[idx]?.id;
            if (id != null && typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("v", id);
              window.history.replaceState(null, "", url);
            }
          } else if (video) {
            video.pause();
          }
        });
      },
      { root: container, threshold: [0, 0.6, 1] }
    );

    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    setExpandedId(null);
  }, [activeIndex]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleAdd = (item, qty = 1, source = null) => {
    addToCart(toCartProduct(item), qty, {
      ...videoCartOptions(item),
      source,
    });
  };

  const handleBuyNow = (item, qty = 1) => {
    buyNow.openBuyNow(toCartProduct(item), qty, videoCartOptions(item));
  };

  const activeItem = items[activeIndex];
  const activeSoldOut = activeItem?.stock === 0;

  return (
    <div className={styles.page}>
      <button
        type="button"
        className={styles.backBtn}
        onClick={handleBack}
        aria-label="Close reels"
      >
        <FiX size={22} />
      </button>

      <div className={styles.topRightActions}>
        <button
          type="button"
          className={styles.shareBtn}
          onClick={() => activeItem && handleShare(activeItem)}
          disabled={!activeItem}
          aria-label="Share this reel"
        >
          <FiShare2 size={18} />
        </button>
        <button
          type="button"
          className={styles.cartIconBtn}
          onClick={(e) => activeItem && handleAdd(activeItem, 1, e.currentTarget)}
          disabled={!activeItem || activeSoldOut}
          aria-label="Add to cart"
        >
          <FiShoppingCart size={18} />
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <p>No reels yet.</p>
          <Link href="/">Go home</Link>
        </div>
      ) : (
        <div className={styles.phoneFrame}>
          <div className={styles.scroller} ref={containerRef}>
            {items.map((item, idx) => (
              <ReelSlide
                key={item.id}
                item={item}
                index={idx}
                slideRef={(el) => (slideRefs.current[idx] = el)}
                videoRef={(el) => (videoRefs.current[idx] = el)}
                expanded={expandedId === item.id}
                onToggleExpand={(val) => setExpandedId(val ? item.id : null)}
                onAdd={handleAdd}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        </div>
      )}

      <BuyNowModal
        open={buyNow.open}
        onClose={buyNow.closeBuyNow}
        product={buyNow.product}
        quantity={buyNow.quantity}
        options={buyNow.options}
      />
    </div>
  );
}

function ReelSlide({
  item,
  index,
  slideRef,
  videoRef,
  expanded,
  onToggleExpand,
  onAdd,
  onBuyNow,
}) {
  const touchStartY = useRef(null);
  const discount = calcDiscount(item.mrp, item.price);
  const soldOut = item.stock === 0;
  const hasMrp = Number(item.mrp) > Number(item.price);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current == null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta < -28 && !expanded) {
      onToggleExpand(true);
      touchStartY.current = null;
    } else if (delta > 28 && expanded) {
      onToggleExpand(false);
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  const handleMouseDown = (e) => {
    touchStartY.current = e.clientY;
  };

  const handleMouseUp = (e) => {
    if (touchStartY.current == null) return;
    const delta = e.clientY - touchStartY.current;
    if (delta < -28 && !expanded) onToggleExpand(true);
    else if (delta > 28 && expanded) onToggleExpand(false);
    touchStartY.current = null;
  };

  return (
    <div className={styles.slide} ref={slideRef} data-index={index}>
      {item.video_url ? (
        <video
          ref={videoRef}
          className={styles.slideVideo}
          src={mediaUrl(item.video_url, API_URL)}
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={item.name}
        />
      ) : (
        <div className={styles.slideNoVideo}>
          <svg
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="2" y="2" width="20" height="20" rx="3" />
            <polygon points="10,8 16,12 10,16" fill="currentColor" />
          </svg>
          <span>No video yet</span>
        </div>
      )}

      {discount > 0 && <span className={styles.slideDiscount}>{discount}% OFF</span>}

      <div className={`${styles.panel} ${expanded ? styles.panelExpanded : ""}`}>
        <div
          className={styles.panelHandleArea}
          onClick={() => onToggleExpand(!expanded)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleExpand(!expanded);
            }
          }}
        >
          <span className={styles.dragHandle} />
          <div className={styles.panelTeaser}>
            <div className={styles.panelTeaserText}>
              {item.category && <span className={styles.category}>{item.category}</span>}
              <h3 className={styles.panelName}>{item.name}</h3>
            </div>
            <div className={styles.panelTeaserRight}>
              <div className={styles.panelTeaserPrice}>
                <span className={styles.panelPrice}>{formatPrice(item.price)}</span>
                {hasMrp && (
                  <span className={styles.panelMrp}>{formatPrice(item.mrp)}</span>
                )}
              </div>
              <FiChevronUp
                size={16}
                className={`${styles.panelChevron} ${expanded ? styles.panelChevronOpen : ""}`}
              />
            </div>
          </div>
        </div>

        <div className={styles.panelBody}>
          <button
            type="button"
            className={styles.previewBuyNow}
            onClick={() => onBuyNow(item)}
            disabled={soldOut}
          >
            <span className={styles.previewBuyLabel}>
              {soldOut ? "Sold out" : "Buy Now"}
            </span>
            {!soldOut && (
              <span className={styles.previewBuyPrices}>
                <strong>{formatPrice(item.price)}</strong>
                {hasMrp && (
                  <em className={styles.previewBuyMrp}>{formatPrice(item.mrp)}</em>
                )}
              </span>
            )}
          </button>

          <ProductImages images={item.images} name={item.name} />

          <ProductMetafields
            product={item}
            showHeading={false}
            className={metafieldStyles.sectionCompact}
          />

          <div className={styles.panelActions}>
            <button
              type="button"
              className={styles.panelAddBtn}
              onClick={(e) => onAdd(item, 1, e.currentTarget)}
              disabled={soldOut}
            >
              <FiShoppingCart size={16} />
              Add to Cart
            </button>
            <button
              type="button"
              className={styles.panelBuyBtn}
              onClick={() => onBuyNow(item)}
              disabled={soldOut}
            >
              {soldOut ? "Sold out" : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
