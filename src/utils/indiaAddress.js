import { API_BASE } from "@/utils/constants";

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

/**
 * Lookup city/state from Indian pincode via our backend proxy
 * (avoids browser CORS / flaky direct calls to postalpincode.in).
 */
export async function lookupPincode(pincode) {
  const pin = String(pincode || "").replace(/\D/g, "");
  if (pin.length !== 6) {
    return { ok: false, error: "Enter a valid 6-digit pincode" };
  }

  try {
    const res = await fetch(`${API_BASE}/shipping-zones/pincode/${pin}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return { ok: false, error: "Pincode not found" };
    }
    const data = await res.json();
    return {
      ok: true,
      city: data.city || "",
      state: data.state || "",
      pincode: data.pincode || pin,
    };
  } catch {
    return { ok: false, error: "Could not look up pincode" };
  }
}
