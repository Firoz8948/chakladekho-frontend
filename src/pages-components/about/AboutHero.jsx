"use client";

import PageHero from "@/components/PageHero/PageHero";
import useScrollReveal from "@/hooks/useScrollReveal";
import styles from "./AboutHero.module.css";

export default function AboutHero() {
  const [ref, visible] = useScrollReveal({ threshold: 0.2, rootMargin: "0px" });

  return (
    <div
      ref={ref}
      className={`${styles.wrap} ${visible ? styles.visible : ""}`}
    >
      <PageHero title="About ChaklaDekho">
        Kitchen essentials for every Indian home — chakla, tawa, belan, spoons,
        spatulas, and mortar & pestle, sold online across India.
      </PageHero>
    </div>
  );
}
