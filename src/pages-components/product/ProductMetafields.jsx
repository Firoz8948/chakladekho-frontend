"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import { metafieldService } from "@/services/metafieldService";
import styles from "./ProductMetafields.module.css";

function isHtmlContent(text) {
  return /<\/?[a-z][\s\S]*>/i.test(text || "");
}

function ContentBody({ content }) {
  if (isHtmlContent(content)) {
    return (
      <div
        className={styles.html}
        dangerouslySetInnerHTML={{ __html: String(content) }}
      />
    );
  }

  return String(content)
    .split("\n")
    .filter(Boolean)
    .map((line, i) => <p key={i}>{line}</p>);
}

export default function ProductMetafields({
  product,
  className = "",
  showHeading = true,
}) {
  const [definitions, setDefinitions] = useState([]);
  const [openKey, setOpenKey] = useState(null);

  useEffect(() => {
    metafieldService
      .getDefinitions()
      .then(setDefinitions)
      .catch(() => {});
  }, []);

  const sections = useMemo(() => {
    const list = [];
    const about = (product?.description || "").trim();
    if (about) {
      list.push({
        key: "__about",
        name: "About this product",
        content: about,
      });
    }

    const values = product?.metafields || {};
    definitions
      .filter((def) => {
        const content = values[def.key];
        return content && String(content).trim();
      })
      .forEach((def) => {
        list.push({
          key: def.key,
          name: def.name,
          content: values[def.key],
        });
      });

    return list;
  }, [definitions, product?.description, product?.metafields]);

  if (!sections.length) return null;

  const toggle = (key) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <section className={`${styles.section} ${className}`.trim()}>
      {showHeading ? <h2 className={styles.heading}>Product Details</h2> : null}
      <div className={styles.accordion}>
        {sections.map((section) => {
          const isOpen = openKey === section.key;
          return (
            <div key={section.key} className={styles.item}>
              <button
                type="button"
                className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
                onClick={() => toggle(section.key)}
                aria-expanded={isOpen}
              >
                <span>{section.name}</span>
                <FiChevronDown
                  className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                />
              </button>
              {isOpen ? (
                <div className={styles.panel}>
                  <ContentBody content={section.content} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
