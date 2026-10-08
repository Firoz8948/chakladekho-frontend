"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAdminAuth } from "@/context/AdminAuthContext";
import adminApi from "@/services/adminApi";

export default function AdminSwitchPage() {
  const router = useRouter();
  const { setAdmin } = useAdminAuth();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const ticket = new URLSearchParams(window.location.hash.slice(1)).get("ticket");
    window.history.replaceState(null, "", window.location.pathname);
    if (!ticket) {
      setError("This switch link is invalid or has expired. Please log in.");
      return;
    }

    adminApi
      .post("/admin/switch/redeem", { ticket })
      .then((res) => {
        const { access_token, admin } = res.data;
        localStorage.setItem("admin_token", access_token);
        localStorage.setItem("admin_user", JSON.stringify(admin));
        setAdmin(admin);
        router.replace("/admin/dashboard");
      })
      .catch((err) =>
        setError(
          err.response?.data?.detail ||
            "This switch link is invalid or has expired. Please log in."
        )
      );
  }, [router, setAdmin]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        textAlign: "center",
      }}
    >
      {error ? (
        <>
          <p style={{ margin: 0, color: "#b91c1c" }}>{error}</p>
          <Link href="/admin/login" style={{ color: "inherit", fontWeight: 600 }}>
            Go to admin login
          </Link>
        </>
      ) : (
        <p style={{ margin: 0, color: "#525252" }}>Switching admin panel…</p>
      )}
    </div>
  );
}
