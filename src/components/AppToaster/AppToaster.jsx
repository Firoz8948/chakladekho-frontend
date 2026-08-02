"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  const [mounted, setMounted] = useState(false);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(min-width: 861px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!mounted) return null;

  return (
    <Toaster
      position="top-center"
      containerStyle={desktop ? { top: 72 } : { top: 16 }}
    />
  );
}
