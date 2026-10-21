"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiArrowLeft, FiLock, FiX } from "react-icons/fi";

import Logo from "@/components/Logo/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useOtpLogin } from "@/hooks/useOtpLogin";
import styles from "./LoginModal.module.css";

/**
 * onClose: user dismissed the modal without signing in.
 * onSuccess: user is signed in (defaults to onClose).
 */
export default function LoginModal({ onClose, onSuccess }) {
  const inputsRef = useRef([]);
  const overlayRef = useRef(null);
  const finishedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    (onSuccess || onClose)();
  };

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
    handleSendOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleResend,
    goBack,
  } = useOtpLogin({
    modal: true,
    onSuccess: finish,
  });

  // Also close when the login happened somewhere else (e.g. another modal).
  useEffect(() => {
    if (isAuthenticated) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (step === "otp") {
      const t = setTimeout(() => inputsRef.current[0]?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [step]);

  if (!mounted) return null;

  const handleClose = () => {
    if (!loading) onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  return createPortal(
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
    >
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close"
        >
          <FiX size={18} />
        </button>

        <div className={styles.header}>
          <div className={styles.logoFrame}>
            <Logo height={80} className={styles.logo} priority />
          </div>
        </div>

        <div className={styles.body} key={step}>
          {step === "phone" && (
            <>
              <div className={styles.stepHead}>
                <h3 className={styles.stepTitle}>Sign in with mobile</h3>
                <p className={styles.stepSub}>
                  Enter your mobile number and we&apos;ll send a one-time
                  password to your phone.
                </p>
              </div>

              <form onSubmit={handleSendOtp} noValidate className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="login-phone">
                    Mobile Number
                  </label>
                  <div className={styles.inputWrap}>
                    <span className={styles.phonePrefix}>+91</span>
                    <input
                      id="login-phone"
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
                  <div className={styles.errorBox} role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className={styles.btnSpinner} /> Sending OTP…
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>

              <div className={styles.trustRow}>
                <FiLock aria-hidden />
                <span>Secure OTP login. We never share your number.</span>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <button type="button" className={styles.backBtn} onClick={goBack}>
                <FiArrowLeft aria-hidden />
                Back
              </button>

              <div className={styles.stepHead}>
                <h3 className={styles.stepTitle}>Enter verification code</h3>
                <p className={styles.stepSub}>
                  We sent a 4-digit code to{" "}
                  <strong className={styles.phoneHighlight}>+91 {phone}</strong>
                </p>
              </div>

              {info && <div className={styles.infoBox}>{info}</div>}
              {debugOtp && (
                <div className={styles.debugBox}>
                  Debug OTP: <strong>{debugOtp}</strong>
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
                    onChange={(e) =>
                      handleOtpChange(i, e.target.value, inputsRef)
                    }
                    onKeyDown={(e) => handleOtpKeyDown(i, e, inputsRef)}
                    autoComplete="one-time-code"
                    disabled={loading}
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>

              {error && (
                <div className={styles.errorBox} role="alert">
                  {error}
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
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
