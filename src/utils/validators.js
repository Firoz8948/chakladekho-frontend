export function isValidPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  // Accept 10-digit Indian mobile, or with country code 91…
  if (digits.length === 10) return /^[6-9]\d{9}$/.test(digits);
  if (digits.length === 12 && digits.startsWith("91")) {
    return /^[6-9]\d{9}$/.test(digits.slice(2));
  }
  return /^\+?\d{10,15}$/.test(String(phone || "").replace(/\s/g, ""));
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function isValidOtp(otp, length = 6) {
  return new RegExp(`^\\d{${length}}$`).test(String(otp || ""));
}

export function isValidPincode(pincode) {
  return /^\d{6}$/.test(String(pincode || "").trim());
}

export function normalizePhone(phone) {
  const cleaned = String(phone || "").replace(/\s/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return cleaned;
}

export function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

/**
 * Checkout / shipping address validation.
 * Returns { ok, errors: { fieldName: message }, firstMessage }.
 */
export function validateCheckoutAddress(form = {}) {
  const errors = {};
  const name = String(form.full_name || "").trim();
  const phone = String(form.phone || "").trim();
  const email = String(form.email || "").trim();
  const line1 = String(form.line1 || "").trim();
  const city = String(form.city || "").trim();
  const state = String(form.state || "").trim();
  const pincode = String(form.pincode || "").replace(/\D/g, "");

  if (!name) {
    errors.full_name = "Enter your full name";
  } else if (name.length < 2) {
    errors.full_name = "Name must be at least 2 characters";
  }

  if (!phone) {
    errors.phone = "Enter your mobile number";
  } else if (!isValidPhone(phone)) {
    errors.phone = "Enter a valid 10-digit mobile number";
  }

  if (email && !isValidEmail(email)) {
    errors.email = "Enter a correct email address";
  }

  if (!line1) {
    errors.line1 = "Enter address line 1";
  } else if (line1.length < 3) {
    errors.line1 = "Enter a more complete address";
  }

  if (!pincode) {
    errors.pincode = "Enter pin code";
  } else if (!isValidPincode(pincode)) {
    errors.pincode = "Enter a valid 6-digit pin code";
  }

  if (!city) {
    errors.city = "Enter city";
  }

  if (!state) {
    errors.state = "Select your state";
  }

  const keys = Object.keys(errors);
  return {
    ok: keys.length === 0,
    errors,
    firstMessage: keys.length ? errors[keys[0]] : null,
  };
}
