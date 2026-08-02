"use client";

import Link from "next/link";
import { FiShoppingCart, FiShare2 } from "react-icons/fi";
import toast from "react-hot-toast";

import BuyNowModal, { useBuyNow } from "@/components/BuyNowModal/BuyNowModal";
import { useCart } from "@/hooks/useCart";
import { calcDiscount, formatPrice } from "@/utils/formatPrice";
import { mediaUrl } from "@/utils/mediaUrl";
import { getProductListingInfo } from "@/utils/productVariants";
import { productShareUrl, shareLink } from "@/utils/share";
import { getProductSocialProof } from "@/utils/socialProof";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const buyNow = useBuyNow();
  const image = mediaUrl(product.images?.[0]);
  const listing = getProductListingInfo(product);
  const discount = calcDiscount(listing.mrp, listing.price);
  const outOfStock = listing.outOfStock;
  const proof = getProductSocialProof(product.id);
  const categoryOnly = product.category || "";

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (listing.hasVariants) return;
    if (!outOfStock) addToCart(product, 1, { source: e.currentTarget });
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (listing.hasVariants) {
      window.location.href = `/product/${product.slug}`;
      return;
    }
    if (outOfStock) return;
    buyNow.openBuyNow(product, 1, { price: listing.price, stock: listing.stock });
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await shareLink({
      title: product.name,
      text: `Check out ${product.name} on ChaklaDekho`,
      url: productShareUrl(product.slug),
    });
    if (res.method === "clipboard") toast.success("Link copied");
    else if (res.method === "failed") toast.error("Could not share");
  };

  return (
    <>
      <Link href={`/product/${product.slug}`} className={styles.card}>
        <div className={styles.imageWrap}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={product.name} className={styles.image} />
          ) : (
            <div className={styles.placeholder}>🥜</div>
          )}
          {discount > 0 && <span className={styles.discount}>{discount}% OFF</span>}
          {outOfStock && <span className={styles.soldOut}>Out of stock</span>}
          <div className={styles.topActions}>
            <button
              type="button"
              className={styles.shareBtn}
              onClick={handleShare}
              aria-label="Share product"
            >
              <FiShare2 size={14} />
            </button>
            <button
              type="button"
              className={styles.addBtn}
              onClick={handleAdd}
              disabled={outOfStock || listing.hasVariants}
              aria-label="Add to cart"
            >
              <FiShoppingCart size={15} />
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {categoryOnly ? (
            <span className={styles.category}>{categoryOnly}</span>
          ) : null}
          <h3 className={styles.name}>{product.name}</h3>
          <div className={styles.rating} aria-label={`${proof.rating} stars`}>
            <span className={styles.stars}>{"\u2605\u2605\u2605\u2605\u2605"}</span>
            <span className={styles.ratingNum}>{proof.ratingLabel}</span>
            <span className={styles.reviews}>{proof.label}</span>
          </div>

          <div className={styles.footer}>
            <div className={styles.price}>
              <span className={styles.current}>
                {listing.hasVariants ? "From " : ""}
                {formatPrice(listing.price)}
              </span>
              {listing.mrp && listing.mrp > listing.price ? (
                <span className={styles.mrp}>{formatPrice(listing.mrp)}</span>
              ) : null}
            </div>
            <button
              type="button"
              className={styles.buyBtn}
              onClick={handleBuyNow}
              disabled={outOfStock}
            >
              Buy Now
            </button>
          </div>
        </div>
      </Link>
      <BuyNowModal
        open={buyNow.open}
        onClose={buyNow.closeBuyNow}
        product={buyNow.product}
        quantity={buyNow.quantity}
        options={buyNow.options}
      />
    </>
  );
}
