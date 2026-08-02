import emailjs from "@emailjs/browser";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

let initialized = false;

function ensureInit() {
  if (!initialized && PUBLIC_KEY) {
    emailjs.init({ publicKey: PUBLIC_KEY });
    initialized = true;
  }
}

/**
 * Send OTP email via EmailJS.
 *
 * EmailJS template settings (dashboard):
 *   To Email field  → {{email}}
 *   Template body   → {{to_name}}, {{otp_code}}, {{expiry_minutes}}, etc.
 */
export async function sendOTPEmail(toEmail, toName, otpCode) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn("EmailJS not configured — skipping email send");
    return { success: false, error: "EmailJS not configured" };
  }

  const email = String(toEmail || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { success: false, error: "Invalid recipient email" };
  }

  ensureInit();

  const templateParams = {
    email,
    to_email: email,
    user_email: email,
    to_name: toName?.trim() || email.split("@")[0],
    otp_code: otpCode,
    brand_name: "ChaklaDekho",
    expiry_minutes: "10",
  };

  try {
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    return { success: true, status: result.status };
  } catch (error) {
    console.error("EmailJS error:", error);
    return {
      success: false,
      error: error?.text || error?.message || "Email send failed",
    };
  }
}
