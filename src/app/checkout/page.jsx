"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Loader from "@/components/Loader/Loader";
import LoginModal from "@/components/LoginModal/LoginModal";
import { OrderSummary, PaymentSection } from "@/pages-components/checkout";
import {
  AddressStep,
  CHECKOUT_STEPS,
  CheckoutProgress,
  ContactStep,
  DeliveryCard,
  PincodeStep,
} from "@/pages-components/checkout/CheckoutSteps";
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
import { validateCheckoutAddress } from "@/utils/validators";
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

function savedName(user) {
  const name = String(user?.name || "").trim();
  return /^customer(\s+\d+)?$/i.test(name) ? "" : name;
}

function savedEmail(user) {
  const email = String(user?.email || "").trim();
  return /\.local$/i.test(email) ? "" : email;
}

function formFromUser(user) {
  if (!user) return emptyForm;
  return {
    full_name: savedName(user),
    phone: user.phone || "",
    email: savedEmail(user),
    line1: user.address_line1 || "",
    line2: user.address_line2 || "",
    landmark: user.address_landmark || "",
    city: user.address_city || "",
    state: user.address_state || "",
    pincode: user.address_pincode || "",
    country: "India",
  };
}

function stepErrors(errors, stepId) {
  const fields = CHECKOUT_STEPS.find((s) => s.id === stepId)?.fields || [];
  return Object.fromEntries(
    Object.entries(errors).filter(([key]) => fields.includes(key)),
  );
}

/** First step whose fields are incomplete; 4 (payment) when everything is valid. */
function firstIncompleteStep(form) {
  const { errors } = validateCheckoutAddress(form);
  for (const s of CHECKOUT_STEPS) {
    if (s.fields.some((field) => errors[field])) return s.id;
  }
  return 4;
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
  const email = String(form.email || "").trim();
  return {
    customer: {
      name: String(form.full_name || "").trim(),
      mobile: String(form.phone || "").trim(),
      email: email || null,
    },
    address: {
      line1: String(form.line1 || "").trim(),
      line2: String(form.line2 || "").trim() || null,
      landmark: String(form.landmark || "").trim() || null,
      city: String(form.city || "").trim(),
      state: String(form.state || "").trim(),
      pincode: String(form.pincode || "").replace(/\D/g, "").slice(0, 6),
      country: form.country || "India",
    },
    items: cart.items.map((item) => ({
      product_id: String(item.product_id),
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const prefilledRef = useRef(false);
  const stepInitRef = useRef(false);
  const checkoutTrackedRef = useRef(false);
  const topRef = useRef(null);

  const goToStep = useCallback((next) => {
    setStep(next);
    setMaxStep((m) => Math.max(m, next));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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
    const prefilled = formFromUser(user);
    setForm(prefilled);
    if (user.address_line1 || user.address_pincode || user.phone || savedName(user)) {
      prefilledRef.current = true;
    }
    // Returning customers with a complete saved address go straight to payment
    if (!stepInitRef.current) {
      stepInitRef.current = true;
      const first = firstIncompleteStep(prefilled);
      setStep(first);
      setMaxStep(first);
    }
  }, [user]);

  const handleAddNewAddress = () => {
    prefilledRef.current = true;
    setFieldErrors({});
    setForm((prev) => ({
      ...emptyForm,
      full_name: prev.full_name || savedName(user),
      phone: user?.phone || prev.phone || "",
      email: prev.email || "",
    }));
    setMaxStep(2);
    goToStep(2);
  };

  const handleNext = (current) => {
    const { errors } = validateCheckoutAddress(form);
    const own = stepErrors(errors, current);
    setFieldErrors(own);
    const keys = Object.keys(own);
    if (keys.length) {
      toast.error(own[keys[0]]);
      return;
    }
    goToStep(current + 1);
  };

  const validateForm = () => {
    const result = validateCheckoutAddress(form);
    setFieldErrors(result.errors);
    if (!result.ok) {
      toast.error(result.firstMessage || "Please fix the highlighted fields");
      goToStep(firstIncompleteStep(form));
      return false;
    }
    return true;
  };

  const clearFieldError = (name) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
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
            onSuccess={() => setLoginOpen(false)}
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

  const stepProps = {
    form,
    onChange: setForm,
    errors: fieldErrors,
    onClearError: clearFieldError,
  };

  return (
    <div className={`container section ${styles.page}`} ref={topRef}>
      <h1 className={styles.heading}>Checkout</h1>
      <CheckoutProgress step={step} maxStep={maxStep} onStepClick={goToStep} />

      <div className={`${styles.flow} ${step === 4 ? styles.onPayment : ""}`}>
        <section className={styles.main}>
          {step === 1 ? (
            <ContactStep {...stepProps} onNext={() => handleNext(1)} />
          ) : null}
          {step === 2 ? (
            <PincodeStep {...stepProps} onNext={() => handleNext(2)} />
          ) : null}
          {step === 3 ? (
            <AddressStep {...stepProps} onNext={() => handleNext(3)} />
          ) : null}
          {step === 4 ? (
            <DeliveryCard
              form={form}
              onEditContact={() => goToStep(1)}
              onEditAddress={() => goToStep(2)}
              onNewAddress={handleAddNewAddress}
            />
          ) : null}
        </section>

        {/* Mounted on every step so promo and shipping quote state survive;
            on mobile it is only shown on the payment step. */}
        <section className={styles.summary}>
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

        {step === 4 ? (
          <section className={styles.payment}>
            <PaymentSection
              method={method}
              onChange={setMethod}
              onPlaceOrder={handlePlaceOrder}
              loading={placing}
              prepaidShipping={hasLocation ? prepaidShipping : null}
              codShipping={hasLocation ? codShipping : null}
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}
