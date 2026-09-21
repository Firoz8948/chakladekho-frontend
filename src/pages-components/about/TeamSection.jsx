"use client";

import { FiGlobe, FiHome, FiPackage, FiUsers } from "react-icons/fi";

import useScrollReveal from "@/hooks/useScrollReveal";
import styles from "./TeamSection.module.css";

const PILLARS = [
  {
    icon: FiPackage,
    title: "Focused Categories",
    text: "Chakla, tawa, belan, serving spoons, spatulas, and mortar & pestle — essentials for every Indian kitchen.",
  },
  {
    icon: FiUsers,
    title: "Wholesale Partners",
    text: "We supply wholesalers and retailers with consistent quality, dependable stock, and fair pricing.",
  },
  {
    icon: FiHome,
    title: "Offline Store",
    text: "Visit us in Nalasopara West, Vasai-Virar — see the products in person and get guidance from our team.",
  },
  {
    icon: FiGlobe,
    title: "Online Ordering",
    text: "Shop from home with secure checkout, fast shipping, COD, and easy returns across India.",
  },
];

export default function TeamSection() {
  const [ref, visible] = useScrollReveal({ threshold: 0.12 });

  return (
    <section
      ref={ref}
      className={`section ${visible ? styles.visible : ""}`}
    >
      <div className="container">
        <h2 className={`section-title ${styles.reveal} ${styles.heading}`}>
          How We Serve
        </h2>
        <p className={`section-subtitle ${styles.reveal} ${styles.sub}`}>
          Wholesale, retail, online & offline — kitchen tools you can trust
        </p>

        <div className={styles.scrollWrap}>
          <div className={styles.grid}>
            {PILLARS.map(({ icon: Icon, title, text }, index) => (
              <div
                key={title}
                className={`${styles.card} ${styles.reveal}`}
                style={{ "--reveal-delay": `${0.12 + index * 0.1}s` }}
              >
                <div className={styles.iconWrap}>
                  <Icon size={26} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
