"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { requestOTP, verifyOTP } from "@/services/authService";

const OTP_LENGTH = 4;
const RESEND_COOLDOWN = 60;

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  const normalized =
    digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  return normalized.length === 10 && /^[6-9]/.test(normalized);
}

export function useOtpLogin({ onSuccess, modal = false } = {}) {
  const { loginSuccess } = useAuth();

  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [debugOtp, setDebugOtp] = useState(null);
  const timerRef = useRef(null);
  const successTimerRef = useRef(null);
  const verifyingRef = useRef(false);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      clearTimeout(successTimerRef.current);
    },
    [],
  );

  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");

    if (!isValidPhone(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const result = await requestOTP(phone.trim(), name.trim());

      if (result.debug && result.otp) {
        setDebugOtp(result.otp);
        setInfo(`Debug mode: OTP is ${result.otp}`);
      } else {
        setInfo(`OTP sent to +91 ${result.phone || phone.trim()}.`);
      }

      setStep("otp");
      startCountdown();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value, inputsRef) => {
    if (value && !/^\d$/.test(value)) return;

    const next = [...otpValues];
    next[index] = value;
    setOtpValues(next);
    setError("");

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (value && next.every(Boolean)) {
      handleVerifyOtp(next.join(""));
    }
  };

  const handleOtpKeyDown = (index, e, inputsRef) => {
    if (e.key === "Backspace") {
      if (otpValues[index]) {
        const next = [...otpValues];
        next[index] = "";
        setOtpValues(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e, inputsRef) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setOtpValues(next);
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[lastFilled]?.focus();

    if (pasted.length === OTP_LENGTH) {
      handleVerifyOtp(pasted);
    }
  };

  const handleVerifyOtp = async (otpOverride = null) => {
    // A paste and the last keystroke can both trigger verify; the second call
    // would reuse a consumed OTP and show "Invalid OTP" after a good login.
    if (verifyingRef.current) return;
    const otp = otpOverride || otpValues.join("");
    if (otp.length < OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits.`);
      return;
    }

    verifyingRef.current = true;
    setError("");
    setLoading(true);
    try {
      const data = await verifyOTP(phone.trim(), otp, name.trim());
      loginSuccess(data.user, data.access_token);
      if (modal) {
        successTimerRef.current = setTimeout(() => onSuccess?.(data.user), 400);
      } else {
        setStep("done");
        onSuccess?.(data.user);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Invalid OTP.");
      setOtpValues(Array(OTP_LENGTH).fill(""));
    } finally {
      verifyingRef.current = false;
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setOtpValues(Array(OTP_LENGTH).fill(""));
    setError("");
    await handleSendOtp();
  };

  const goBack = () => {
    setStep("phone");
    setOtpValues(Array(OTP_LENGTH).fill(""));
    setError("");
    setInfo("");
    setDebugOtp(null);
    clearInterval(timerRef.current);
  };

  const reset = useCallback(() => {
    setStep("phone");
    setPhone("");
    setName("");
    setOtpValues(Array(OTP_LENGTH).fill(""));
    setError("");
    setInfo("");
    setDebugOtp(null);
    setCountdown(0);
    clearInterval(timerRef.current);
  }, []);

  return {
    step,
    phone,
    setPhone,
    name,
    setName,
    otpValues,
    loading,
    error,
    info,
    countdown,
    debugOtp,
    OTP_LENGTH,
    handleSendOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleVerifyOtp,
    handleResend,
    goBack,
    reset,
  };
}
