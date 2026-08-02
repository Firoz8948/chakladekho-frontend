"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import { FREE_SHIPPING_THRESHOLD } from "@/utils/constants";
import styles from "./FaqSection.module.css";

const FAQS = [
  {
    question: "What products does ChaklaDekho sell?",
    answer:
      "We specialise in kitchen essentials — chakla, tawa, belan (rolling pin), serving spoons, spatulas, and mortar & pestle — chosen for everyday Indian cooking.",
  },
  {
    question: "Are your products durable for daily use?",
    answer:
      "Yes. Every piece is selected for strength, finish, and comfortable handling so it holds up to regular kitchen use at home or in a busy store.",
  },
  {
    question: "Do you offer free shipping?",
    answer: `Free shipping is available on orders above ₹${FREE_SHIPPING_THRESHOLD}. For smaller orders, a flat shipping charge applies at checkout.`,
  },
  {
    question: "How should I care for wooden kitchen tools?",
    answer:
      "Hand-wash with mild soap, dry thoroughly, and occasionally rub with food-safe oil. Avoid soaking for long periods or putting wooden tools in the dishwasher.",
  },
  {
    question: "Can I place bulk or wholesale orders?",
    answer:
      "Absolutely. Reach out through our Contact page or WhatsApp for wholesale pricing and bulk order support across India.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section className={`section ${styles.wrap}`}>
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">Quick answers about our products and orders</p>

        <div className={styles.list}>
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question} className={`${styles.item} ${isOpen ? styles.open : ""}`}>
                <button
                  type="button"
                  className={styles.question}
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <FiChevronDown className={styles.chevron} aria-hidden />
                </button>
                <div className={styles.answerWrap}>
                  <p className={styles.answer}>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
