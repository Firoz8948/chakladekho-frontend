"use client";

import { useEffect, useMemo, useState } from "react";
import { FiMinus, FiPlus, FiShare2 } from "react-icons/fi";
import toast from "react-hot-toast";

import Button from "@/components/Button/Button";
import BuyNowModal, { useBuyNow } from "@/components/BuyNowModal/BuyNowModal";
import { useCart } from "@/hooks/useCart";
import { calcDiscount, formatPrice } from "@/utils/formatPrice";
import { trackViewContent } from "@/utils/metaPixel";
import {
  formatWeightGrams,
  getVariantOptions,
  parseWeightGrams,
} from "@/utils/productVariants";
import { productShareUrl, shareLink } from "@/utils/share";
import { getProductSocialProof } from "@/utils/socialProof";
import styles from "./ProductInfo.module.css";

function resolveOptionWeight(option) {
  if (option.weight && option.weight > 0) return option.weight;
  return parseWeightGrams(option.name);
}

export default function ProductInfo({ product }) {
  const { addToCart } = useCart();
  const buyNow = useBuyNow();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const proof = getProductSocialProof(product.id);

  const variantData = useMemo(() => getVariantOptions(product), [product]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  const options = variantData?.options || [];
  const selectedOption = useMemo(() => {
    if (!options.length) return null;
    const found = options.find((o) => o.id === selectedOptionId);
    if (found) return found;
    const inStock = options.find((o) => (o.stock ?? 0) > 0);
    return inStock || options[0];
  }, [options, selectedOptionId]);

  useEffect(() => {
    if (selectedOption?.id) {
      setSelectedOptionId(selectedOption.id);
    }
  }, [selectedOption?.id]);

  useEffect(() => {
    if (product?.id) trackViewContent(product);
  }, [product?.id]);

  const displayPrice = selectedOption?.price ?? product.price;
  const displayMrp = selectedOption?.mrp ?? product.mrp;
  const displayStock = selectedOption
    ? selectedOption.stock ?? 0
    : product.stock ?? 0;
  const weightGrams = selectedOption
    ? resolveOptionWeight(selectedOption)
    : product.weight
      ? Number(product.weight)
      : null;

  const discount = calcDiscount(displayMrp, displayPrice);
  const outOfStock = displayStock <= 0;
  const categoryOnly = product.category || "";

  const handleAdd = async (e) => {
    setAdding(true);
    const variantInfo = selectedOption
      ? {
          variant_name: variantData.variantName,
          option_name: selectedOption.name,
          option_id: selectedOption.id,
          weight_grams: weightGrams,
        }
      : null;

    addToCart(product, qty, {
      price: displayPrice,
      mrp: displayMrp,
      stock: displayStock,
      weightGrams,
      variantInfo,
      source: e?.currentTarget || null,
    });
    setAdding(false);
  };

  const cartOptions = {
    price: displayPrice,
    mrp: displayMrp,
    stock: displayStock,
    weightGrams,
    variantInfo: selectedOption
      ? {
          variant_name: variantData.variantName,
          option_name: selectedOption.name,
          option_id: selectedOption.id,
          weight_grams: weightGrams,
        }
      : null,
  };

  const handleBuyNow = () => {
    buyNow.openBuyNow(product, qty, cartOptions);
  };

  const handleShare = async () => {
    const res = await shareLink({
      title: product.name,
      text: `Check out ${product.name} on ChaklaDekho`,
      url: productShareUrl(product.slug),
    });
    if (res.method === "clipboard") toast.success("Link copied");
    else if (res.method === "failed") toast.error("Could not share");
  };

  return (
    <div className={styles.info}>
      {categoryOnly ? (
        <span className={styles.category}>{categoryOnly}</span>
      ) : null}
      <div className={styles.titleRow}>
        <h1 className={styles.name}>{product.name}</h1>
        <button
          type="button"
          className={styles.shareBtn}
          onClick={handleShare}
          aria-label="Share"
        >
          <FiShare2 size={18} />
        </button>
      </div>
      <div className={styles.rating}>
        <span className={styles.stars}>{"\u2605\u2605\u2605\u2605\u2605"}</span>
        <strong>{proof.ratingLabel}</strong>
        <span>{proof.label}</span>
      </div>

      <div className={styles.priceRow}>
        <span className={styles.price}>{formatPrice(displayPrice)}</span>
        {displayMrp && displayMrp > displayPrice ? (
          <>
            <span className={styles.mrp}>{formatPrice(displayMrp)}</span>
            <span className={styles.save}>{discount}% off</span>
          </>
        ) : null}
      </div>

      {variantData && (
        <div className={styles.variants}>
          <span className={styles.variantLabel}>{variantData.variantName}</span>
          <div className={styles.variantOptions}>
            {options.map((opt) => {
              const optStock = opt.stock ?? 0;
              const isSelected = selectedOption?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.variantBtn} ${isSelected ? styles.variantBtnActive : ""} ${optStock <= 0 ? styles.variantBtnDisabled : ""}`}
                  onClick={() => setSelectedOptionId(opt.id)}
                  disabled={optStock <= 0}
                >
                  {opt.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {weightGrams ? (
        <p className={styles.weight}>
          Pack weight: {formatWeightGrams(weightGrams)}
        </p>
      ) : product.weight ? (
        <p className={styles.weight}>
          Pack size: {product.weight} {product.unit}
        </p>
      ) : null}

      <div className={styles.stock}>
        {outOfStock ? (
          <span className={styles.out}>Out of Stock</span>
        ) : (
          <span className={styles.in}>In Stock</span>
        )}
      </div>

      {!outOfStock && (
        <div className={styles.actions}>
          <div className={styles.qty}>
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              <FiMinus />
            </button>
            <span>{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(displayStock, q + 1))}
              aria-label="Increase quantity"
            >
              <FiPlus />
            </button>
          </div>
          <div className={styles.actionBtns}>
            <Button size="lg" loading={adding} onClick={handleAdd}>
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" onClick={handleBuyNow}>
              Buy Now
            </Button>
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
