"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Loader from "@/components/Loader/Loader";
import LoginModal from "@/components/LoginModal/LoginModal";
import { AddressForm, OrderSummary, PaymentSection } from "@/pages-components/checkout";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { updateProfile } from "@/services/authService";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { BRAND, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_CHARGE } from "@/utils/constants";
import {
  metaCookies,
  newEventId,
  trackInitiateCheckout,
  trackPurchase,
} from "@/utils/metaPixel";
import { isValidPincode, required } from "@/utils/validators";
import styles from "./checkout.module.css";

const emptyForm = {
  full_name: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

function formFromUser(user) {
  if (!user) return emptyForm;
  return {
    full_name: user.name || "",
    phone: user.phone || "",
    email: user.email || "",
    line1: user.address_line1 || "",
    line2: user.address_line2 || "",
    landmark: user.address_landmark || "",
    city: user.address_city || "",
    state: user.address_state || "",
    pincode: user.address_pincode || "",
    country: "India",
  };
}

function hasSavedAddress(user) {
  return !!(user?.address_line1 && user?.address_pincode);
}

async function saveAddressToProfile(form) {
  try {
    await updateProfile({
      name: form.full_name?.trim() || undefined,
      address_line1: form.line1?.trim() || "",
      address_line2: form.line2?.trim() || "",
      address_landmark: form.landmark?.trim() || "",
      address_city: form.city?.trim() || "",
      address_state: form.state?.trim() || "",
      address_pincode: form.pincode?.trim() || "",
    });
  } catch {
    // Non-blocking — order already succeeded
  }
}

function submitPayuForm(paymentUrl, fields) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentUrl;
  form.style.display = "none";
  Object.entries(fields || {}).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value == null ? "" : String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function buildCheckoutPayload(cart, form, promoCode, meta = {}) {
  return {
    customer: {
      name: form.full_name,
      mobile: form.phone,
      email: form.email || null,
    },
    address: {
      line1: form.line1,
      line2: form.line2 || null,
      landmark: form.landmark || null,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      country: form.country,
    },
    items: cart.items.map((item) => ({
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      weight: item.weight,
      weight_grams: item.weight_grams,
      variant_info: item.variant_info,
    })),
    promo_code: promoCode || null,
    ...meta,
  };
}

function resolveShippingFromQuote(quote, subtotal, kind) {
  if (!quote) {
    return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal <= 0
      ? 0
      : FLAT_SHIPPING_CHARGE;
  }
  if (kind === "cod") {
    if (quote.cod_shipping_charge != null) return quote.cod_shipping_charge;
    if (quote.cod_rate != null) {
      const threshold = quote.free_shipping_threshold ?? FREE_SHIPPING_THRESHOLD;
      return subtotal >= threshold ? 0 : quote.cod_rate;
    }
  } else {
    if (quote.prepaid_shipping_charge != null) return quote.prepaid_shipping_charge;
    if (quote.prepaid_rate != null) {
      const threshold = quote.free_shipping_threshold ?? FREE_SHIPPING_THRESHOLD;
      return subtotal >= threshold ? 0 : quote.prepaid_rate;
    }
  }
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal <= 0
    ? 0
    : FLAT_SHIPPING_CHARGE;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { isAuthenticated, user, loading: authLoading, refresh } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [method, setMethod] = useState("payu");
  const [placing, setPlacing] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [promo, setPromo] = useState(null);
  const [shippingQuote, setShippingQuote] = useState(null);
  const prefilledRef = useRef(false);
  const checkoutTrackedRef = useRef(false);

  const handleShippingQuoteChange = useCallback((quote) => {
    setShippingQuote(quote);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLoginOpen(true);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "failed") {
      toast.error("Payment failed or cancelled. You can try again.");
    }
  }, []);

  useEffect(() => {
    if (
      isAuthenticated &&
      cart.items.length > 0 &&
      !checkoutTrackedRef.current
    ) {
      checkoutTrackedRef.current = true;
      trackInitiateCheckout(cart);
    }
  }, [isAuthenticated, cart]);

  useEffect(() => {
    if (isAuthenticated) {
      prefilledRef.current = false;
      refresh();
    }
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (!user || prefilledRef.current) return;
    setForm(formFromUser(user));
    if (hasSavedAddress(user) || user.phone || user.name) {
      prefilledRef.current = true;
    }
  }, [user]);

  const handleAddNewAddress = () => {
    prefilledRef.current = true;
    setForm({
      ...emptyForm,
      full_name: form.full_name || user?.name || "",
      phone: user?.phone || form.phone || "",
      email: form.email || "",
    });
  };

  const validateForm = () => {
    const requiredFields = ["full_name", "phone", "line1", "city", "state", "pincode"];
    for (const f of requiredFields) {
      if (!required(form[f])) {
        toast.error("Please fill in all required fields");
        return false;
      }
    }
    if (!isValidPincode(form.pincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return false;
    }
    return true;
  };

  const handleOnlinePayment = async () => {
    const config = await paymentService.getConfig();
    if (!config?.configured) {
      toast.error(
        "Online payment is not configured yet. Please use COD or contact the store."
      );
      return;
    }

    const purchaseEventId = newEventId("Purchase");
    const meta = { meta_event_id: purchaseEventId, ...metaCookies() };
    const payload = buildCheckoutPayload(cart, form, promo?.code, meta);
    const data = await paymentService.createOrder(payload);

    if (data.provider === "payu" || data.payu) {
      // Store meta for post-return analytics (PayU redirects away)
      try {
        sessionStorage.setItem(
          "cd_pending_purchase",
          JSON.stringify({
            eventId: purchaseEventId,
            total: data.amount,
            items: cart.items,
          })
        );
      } catch {
        /* ignore */
      }
      await saveAddressToProfile(form);
      submitPayuForm(data.payment_url, data.payu);
      return;
    }

    const ok = await loadRazorpay();
    if (!ok) {
      toast.error("Failed to load payment gateway");
      return;
    }

    const options = {
      key: data.key_id || config.key_id,
      amount: data.amount,
      currency: data.currency,
      name: BRAND.name,
      description: "Iron cookware order",
      order_id: data.razorpay_order_id,
      prefill: {
        name: form.full_name,
        contact: form.phone,
        email: form.email || "",
      },
      theme: { color: "#5E3023" },
      handler: async (response) => {
        try {
          const result = await paymentService.verify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            ...meta,
          });
          trackPurchase({
            orderId: result.order_id,
            total: result.order?.total ?? cart.total_amount,
            items: cart.items,
            eventId: purchaseEventId,
          });
          await saveAddressToProfile(form);
          await refresh();
          clearCart();
          toast.success("Payment successful!");
          router.push(`/orders?order=${result.order_id}`);
        } catch (err) {
          toast.error(err.message || "Payment verification failed");
        }
      },
      modal: {
        ondismiss: () => toast("Payment cancelled", { icon: "⚠️" }),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      const desc =
        response?.error?.description ||
        response?.error?.reason ||
        "Payment failed";
      toast.error(desc);
    });
    rzp.open();
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    if (!validateForm()) return;
    setPlacing(true);
    try {
      const purchaseEventId = newEventId("Purchase");
      const meta = { meta_event_id: purchaseEventId, ...metaCookies() };
      const payload = {
        ...buildCheckoutPayload(cart, form, promo?.code, meta),
        payment_method: method === "payu" ? "payu" : method,
      };

      if (method === "cod") {
        const order = await orderService.createOrder(payload);
        trackPurchase({
          orderId: order.order_id,
          total: order.total ?? cart.total_amount,
          items: cart.items,
          eventId: purchaseEventId,
        });
        await saveAddressToProfile(form);
        await refresh();
        clearCart();
        toast.success("Order placed successfully!");
        router.push(`/orders?order=${order.order_id}`);
      } else {
        await handleOnlinePayment();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (cartLoading || authLoading) return <Loader fullScreen />;

  if (!cart.items.length) {
    return (
      <div className="container section" style={{ textAlign: "center" }}>
        <h2>Your cart is empty</h2>
        <p className="text-muted">Add items before checking out.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="container section" style={{ textAlign: "center" }}>
          <h2>Sign in to checkout</h2>
          <p className="text-muted">
            Mobile OTP login is required to place an order.
          </p>
        </div>
        {loginOpen && (
          <LoginModal
            onClose={() => {
              setLoginOpen(false);
              router.push("/cart");
            }}
          />
        )}
      </>
    );
  }

  const subtotal = cart.total_amount;
  const prepaidShipping = resolveShippingFromQuote(shippingQuote, subtotal, "prepaid");
  const codShipping = resolveShippingFromQuote(shippingQuote, subtotal, "cod");
  const hasLocation =
    (form.state && form.state.trim()) ||
    String(form.pincode || "").replace(/\D/g, "").length === 6;

  return (
    <div className={`container section ${styles.page}`}>
      <h1 className={styles.heading}>Checkout</h1>
      <p className={styles.subtitle}>
        Signed in as +91 {user?.phone}.
        {hasSavedAddress(user)
          ? " Your saved address is prefilled below."
          : " Complete your delivery details below."}
      </p>
      <div className={styles.layout}>
        <div className={styles.flow}>
          <section className={styles.step} data-step="shipping">
            <AddressForm
              address={form}
              onChange={setForm}
              phoneReadOnly
              onAddNewAddress={handleAddNewAddress}
            />
          </section>

          <section className={styles.step} data-step="payment">
            <PaymentSection
              method={method}
              onChange={setMethod}
              onPlaceOrder={handlePlaceOrder}
              loading={placing}
              prepaidShipping={hasLocation ? prepaidShipping : null}
              codShipping={hasLocation ? codShipping : null}
            />
          </section>

          <section className={`${styles.step} ${styles.summaryStep}`} data-step="summary">
            <OrderSummary
              promo={promo}
              onPromoChange={setPromo}
              pincode={form.pincode}
              state={form.state}
              phone={form.phone || user?.phone || ""}
              paymentMethod={method}
              onShippingQuoteChange={handleShippingQuoteChange}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
