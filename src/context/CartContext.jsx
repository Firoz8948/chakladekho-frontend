"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

import CartFlyLayer, {
  getCartTargetEl,
  resolveSourceRect,
} from "@/components/CartFlyLayer/CartFlyLayer";
import { CART_STORAGE_KEY } from "@/utils/constants";
import { trackAddToCart } from "@/utils/metaPixel";
import { buildCartKey, formatWeightGrams } from "@/utils/productVariants";

const CartContext = createContext(null);

const emptyCart = { items: [], total_items: 0, total_amount: 0 };

function loadStoredItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : parsed?.cart || [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function buildCart(items) {
  const enriched = items.map((item) => ({
    ...item,
    item_id: item.cart_key || item.product_id,
    subtotal: round(item.price * item.quantity),
  }));
  const total_items = enriched.reduce((sum, i) => sum + i.quantity, 0);
  const total_amount = round(enriched.reduce((sum, i) => sum + i.subtotal, 0));
  return { items: enriched, total_items, total_amount };
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function showAddedToast() {
  toast.custom(
    (t) => (
      <div
        className={`chakla-cart-toast ${t.visible ? "chakla-cart-toast-in" : "chakla-cart-toast-out"}`}
        role="status"
      >
        <span className="chakla-cart-toast-icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M24 3l-.743 2h-1.929l-3.474 12h-13.239l-4.615-11h16.812l-.564 2h-13.24l2.937 7h10.428l3.432-12h4.195zm-15.5 15c-.828 0-1.5.672-1.5 1.5 0 .829.672 1.5 1.5 1.5s1.5-.671 1.5-1.5c0-.828-.672-1.5-1.5-1.5zm6.9-7-1.9 7c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5c0-.828-.672-1.5-1.5-1.5z" />
          </svg>
        </span>
        <div className="chakla-cart-toast-copy">
          <strong>Added to cart</strong>
          <span>Flying to your bag…</span>
        </div>
      </div>
    ),
    { duration: 1800, position: "top-center" },
  );
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(emptyCart);
  const [ready, setReady] = useState(false);
  const [flights, setFlights] = useState([]);
  const [cartBump, setCartBump] = useState(0);

  const persist = useCallback((items) => {
    saveItems(items);
    setCart(buildCart(items));
  }, []);

  useEffect(() => {
    persist(loadStoredItems());
    setReady(true);
  }, [persist]);

  const flyToCart = useCallback((source, image) => {
    const startRect = resolveSourceRect(source);
    const targetEl = getCartTargetEl();
    const targetRect = targetEl?.getBoundingClientRect?.();
    if (!startRect || !targetRect) return false;

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `fly-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setFlights((prev) => [
      ...prev,
      {
        id,
        startX: startRect.left + startRect.width / 2,
        startY: startRect.top + startRect.height / 2,
        endX: targetRect.left + targetRect.width / 2,
        endY: targetRect.top + targetRect.height / 2,
        image: image || null,
      },
    ]);

    window.setTimeout(() => {
      setCartBump((n) => n + 1);
      targetEl?.classList?.add("chakla-cart-bump");
      window.setTimeout(
        () => targetEl?.classList?.remove("chakla-cart-bump"),
        450,
      );
    }, 620);

    return true;
  }, []);

  const onFlightEnd = useCallback((id) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const addToCart = (product, quantity = 1, options = {}) => {
    const {
      price = product.price,
      stock = product.stock,
      weightGrams = product.weight ? Number(product.weight) : null,
      variantInfo = null,
      source = null,
    } = options;

    if ((stock ?? 0) <= 0) {
      toast.error("This option is out of stock");
      return false;
    }

    const cartKey = buildCartKey(product.id, variantInfo);
    const displayName = variantInfo
      ? `${product.name} (${variantInfo.option_name})`
      : product.name;

    const weightLabel = weightGrams ? formatWeightGrams(weightGrams) : null;

    const items = loadStoredItems();
    const existing = items.find(
      (i) => (i.cart_key || String(i.product_id)) === cartKey,
    );

    if (existing) {
      const nextQty = existing.quantity + quantity;
      if (nextQty > stock) {
        toast.error(`Only ${stock} available`);
        return false;
      }
      existing.quantity = nextQty;
    } else {
      items.push({
        cart_key: cartKey,
        product_id: product.id,
        name: displayName,
        slug: product.slug,
        price,
        quantity,
        image: product.images?.[0] || null,
        weight: weightLabel,
        weight_grams: weightGrams,
        length_cm: product.length_cm ?? options.length_cm ?? null,
        breadth_cm: product.breadth_cm ?? options.breadth_cm ?? null,
        height_cm: product.height_cm ?? options.height_cm ?? null,
        variant_info: variantInfo
          ? {
              ...variantInfo,
              length_cm: product.length_cm ?? options.length_cm ?? null,
              breadth_cm: product.breadth_cm ?? options.breadth_cm ?? null,
              height_cm: product.height_cm ?? options.height_cm ?? null,
            }
          : {
              length_cm: product.length_cm ?? options.length_cm ?? null,
              breadth_cm: product.breadth_cm ?? options.breadth_cm ?? null,
              height_cm: product.height_cm ?? options.height_cm ?? null,
            },
      });
    }

    persist(items);
    trackAddToCart(product, quantity, price);
    flyToCart(source, product.images?.[0] || null);
    showAddedToast();
    return true;
  };

  const updateItem = (itemId, quantity) => {
    const items = loadStoredItems()
      .map((i) => {
        const key = i.cart_key || String(i.product_id);
        if (key !== String(itemId)) return i;
        return { ...i, quantity };
      })
      .filter((i) => i.quantity > 0);
    persist(items);
  };

  const removeItem = (itemId) => {
    const items = loadStoredItems().filter(
      (i) => (i.cart_key || String(i.product_id)) !== String(itemId),
    );
    persist(items);
    toast.success("Item removed");
  };

  const clearCart = () => {
    persist([]);
  };

  const value = {
    cart,
    loading: !ready,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    itemCount: cart.total_items,
    cartBump,
    flyToCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartFlyLayer flights={flights} onFlightEnd={onFlightEnd} />
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used within CartProvider");
  return ctx;
}
