"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { HiOutlineHandRaised } from "react-icons/hi2";

import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import AdminSidebar from "@/components/AdminSidebar/AdminSidebar";
import styles from "./admin.module.css";

function AdminShell({ children }) {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !admin && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [admin, loading, pathname, router]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const media = window.matchMedia("(max-width: 768px)");
    const lockScroll = () => {
      if (!media.matches) return;
      document.body.style.overflow = "hidden";
    };

    lockScroll();
    media.addEventListener("change", lockScroll);

    return () => {
      media.removeEventListener("change", lockScroll);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (loading)
    return (
      <div className={styles.fullLoader}>
        <div className={styles.spinner} />
      </div>
    );
  if (!admin) return null;

  return (
    <div className={styles.shell}>
      {sidebarOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
          <h1 className={styles.pageTitle}>
            <HiOutlineHandRaised className={styles.welcomeIcon} aria-hidden />
            Welcome Vikram Bhai
          </h1>
          <div className={styles.adminBadge}>{admin?.name || "Admin"}</div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
