"use client";

import { useEffect, useState } from "react";

import { fetchFreeGift } from "@/services/freeGiftService";

export function useFreeGift() {
  const [gift, setGift] = useState(null);

  useEffect(() => {
    let active = true;
    fetchFreeGift().then((data) => {
      if (active) setGift(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return gift;
}
