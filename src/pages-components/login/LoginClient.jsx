"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Logo from "@/components/Logo/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useOtpLogin } from "@/hooks/useOtpLogin";
import styles from "./LoginClient.module.css";

export default function LoginClient() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const inputsRef = useRef([]);

  const {
    step,
    phone,
    setPhone,
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
    handleResend,
    goBack,
  } = useOtpLogin({
    onSuccess: () => {
      setTimeout(() => router.push(redirect), 800);
    },
  });

  useEffect(() => {
    if (isLoggedIn) router.replace(redirect);
  }, [isLoggedIn, redirect, router]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }
  }, [step]);

  return (
    <div className={styles.page}>
      <div className={styles.bg} />

      <div className={styles.card}>
        <div className={styles.brand}>
          <Logo size={72} className={styles.brandLogo} priority />
          <h1 className={styles.brandName}>ChaklaDekho</h1>
          <p className={styles.brandSub}>Premium Quality, Naturally Pure</p>
        </div>

        {step === "phone" && (
          <div className={styles.body}>
            <h2 className={styles.stepTitle}>Sign In</h2>
            <p className={styles.stepSub}>
              Enter your mobile number to receive a one-time password
            </p>

            <form onSubmit={handleSendOtp} className={styles.form} noValidate>
              <div className={styles.field}>
                <label className={styles.label}>Mobile Number *</label>
                <div className={styles.inputWrap}>
                  <span className={styles.phonePrefix}>+91</span>
                  <input
                    className={`${styles.input} ${styles.inputWithPrefix} ${error ? styles.inputError : ""}`}
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {error && (
                <div className={styles.errorBox}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? (
                  <>
                    <span className={styles.btnSpinner} /> Sending OTP…
                  </>
                ) : (
                  <>Send OTP →</>
                )}
              </button>
            </form>

            <p className={styles.footNote}>
              We&apos;ll send a 4-digit code via SMS. No password needed.
            </p>
          </div>
        )}

        {step === "otp" && (
          <div className={styles.body}>
            <button type="button" className={styles.backBtn} onClick={goBack}>
              ← Back
            </button>

            <h2 className={styles.stepTitle}>Enter OTP</h2>
            <p className={styles.stepSub}>
              We sent a 4-digit code to
              <br />
              <strong>+91 {phone}</strong>
            </p>

            {info && (
              <div className={styles.infoBox}>
                <span>📱</span> {info}
              </div>
            )}

            {debugOtp && (
              <div className={styles.debugBox}>
                🛠 Debug OTP: <strong>{debugOtp}</strong>
              </div>
            )}

            <div
              className={styles.otpRow}
              onPaste={(e) => handleOtpPaste(e, inputsRef)}
            >
              {otpValues.map((val, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  className={`${styles.otpInput} ${val ? styles.otpFilled : ""} ${error ? styles.otpError : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(i, e.target.value, inputsRef)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e, inputsRef)}
                  autoComplete="one-time-code"
                  disabled={loading}
                />
              ))}
            </div>

            {error && (
              <div className={styles.errorBox}>
                <span>⚠️</span> {error}
              </div>
            )}

            {loading && (
              <div className={styles.verifyingRow}>
                <span className={styles.btnSpinner} />
                <span>Verifying…</span>
              </div>
            )}

            <div className={styles.resendRow}>
              <span className={styles.resendText}>Didn&apos;t receive it?</span>
              {countdown > 0 ? (
                <span className={styles.countdown}>Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={handleResend}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {step === "done" && (
          <div className={styles.body}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.stepTitle}>Login Successful!</h2>
            <p className={styles.stepSub}>Welcome back! Redirecting you…</p>
            <div className={styles.successSpinner} />
          </div>
        )}

        <p className={styles.footer}>Your data is safe with us · No spam ever</p>
      </div>
    </div>
  );
}
