"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import styles from "./ProductInfo.module.css";

function resolveOptionWeight(option) {
  if (option.weight && option.weight > 0) return option.weight;
  return parseWeightGrams(option.name);
}

// The public product API omits option ids, so fall back to the option name.
function optionKey(option) {
  return String(option.id ?? option.name);
}

export default function ProductInfo({ product }) {
  const { addToCart } = useCart();
  const buyNow = useBuyNow();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const variantData = useMemo(() => getVariantOptions(product), [product]);
  const options = useMemo(() => variantData?.options || [], [variantData]);
  const [selectedKey, setSelectedKey] = useState(() =>
    options.length === 1 ? optionKey(options[0]) : null,
  );
  const [variantError, setVariantError] = useState(false);
  const [shake, setShake] = useState(false);
  const variantsRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((o) => optionKey(o) === selectedKey) || null,
    [options, selectedKey],
  );
  const needsChoice = options.length > 0 && !selectedOption;

  useEffect(() => {
    if (product?.id) trackViewContent(product);
  }, [product?.id]);

  // Before a choice, show the cheapest option ("From ₹…") like the shop cards.
  const cheapestOption = useMemo(() => {
    const priced = options.filter((o) => o.price > 0);
    if (!priced.length) return null;
    return priced.reduce((min, o) => (o.price < min.price ? o : min));
  }, [options]);
  const priceSource = selectedOption || cheapestOption;
  const showFrom =
    needsChoice && new Set(options.map((o) => o.price)).size > 1;

  const displayPrice = priceSource?.price ?? product.price;
  const displayMrp = priceSource?.mrp ?? product.mrp;
  const displayStock = selectedOption
    ? selectedOption.stock ?? 0
    : options.length
      ? Math.max(...options.map((o) => o.stock ?? 0))
      : product.stock ?? 0;
  const weightGrams = selectedOption
    ? resolveOptionWeight(selectedOption)
    : product.weight
      ? Number(product.weight)
      : null;

  const discount = calcDiscount(displayMrp, displayPrice);
  const outOfStock = displayStock <= 0;
  const categoryOnly = product.category || "";

  const promptVariant = () => {
    setVariantError(true);
    setShake(false);
    requestAnimationFrame(() => setShake(true));
    variantsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const selectOption = (opt) => {
    setSelectedKey(optionKey(opt));
    setVariantError(false);
    setQty((q) => Math.min(q, Math.max(1, opt.stock ?? 1)));
  };

  const handleAdd = async (e) => {
    if (needsChoice) {
      promptVariant();
      return;
    }
    setAdding(true);
    const variantInfo = selectedOption
      ? {
          variant_name: variantData.variantName,
          option_name: selectedOption.name,
          option_id: optionKey(selectedOption),
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
          option_id: optionKey(selectedOption),
          weight_grams: weightGrams,
        }
      : null,
  };

  const handleBuyNow = () => {
    if (needsChoice) {
      promptVariant();
      return;
    }
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
      <div className={styles.priceRow}>
        <span className={styles.price}>
          {showFrom ? <span className={styles.fromLabel}>From </span> : null}
          {formatPrice(displayPrice)}
        </span>
        {displayMrp && displayMrp > displayPrice ? (
          <>
            <span className={styles.mrp}>{formatPrice(displayMrp)}</span>
            <span className={styles.save}>{discount}% off</span>
          </>
        ) : null}
      </div>

      {variantData && (
        <div
          ref={variantsRef}
          className={`${styles.variants} ${shake ? styles.shake : ""}`}
          onAnimationEnd={() => setShake(false)}
        >
          <span className={styles.variantLabel}>
            {variantData.variantName}
            {selectedOption ? `: ${selectedOption.name}` : ""}
          </span>
          <div
            className={styles.variantOptions}
            role="radiogroup"
            aria-label={variantData.variantName}
          >
            {options.map((opt) => {
              const optStock = opt.stock ?? 0;
              const isSelected = selectedKey === optionKey(opt);
              return (
                <button
                  key={optionKey(opt)}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`${styles.variantBtn} ${isSelected ? styles.variantBtnActive : ""} ${optStock <= 0 ? styles.variantBtnDisabled : ""} ${variantError ? styles.variantBtnError : ""}`}
                  onClick={() => selectOption(opt)}
                  disabled={optStock <= 0}
                >
                  {opt.name}
                </button>
              );
            })}
          </div>
          {variantError ? (
            <p className={styles.variantError} role="alert">
              Please choose a {variantData.variantName.toLowerCase()}
            </p>
          ) : null}
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
