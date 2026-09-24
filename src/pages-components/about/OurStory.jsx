"use client";

import Image from "next/image";
import Link from "next/link";

import useScrollReveal from "@/hooks/useScrollReveal";
import { ASSETS, BRAND } from "@/utils/constants";
import styles from "./OurStory.module.css";

export default function OurStory() {
  const [ref, visible] = useScrollReveal({ threshold: 0.15 });

  return (
    <section
      ref={ref}
      className={`section ${styles.section} ${visible ? styles.visible : ""}`}
    >
      <div className={`container ${styles.grid}`}>
        <div className={`${styles.logoStage} ${styles.reveal}`}>
          <span className={styles.stageEyebrow}>Made for Indian kitchens</span>
          <div className={styles.logoFrame}>
            <Image
              src={ASSETS.logo}
              alt={`${BRAND.name} — kitchen essentials`}
              width={684}
              height={492}
              sizes="(max-width: 900px) 80vw, 420px"
              className={styles.logoArtwork}
            />
          </div>
          <div className={styles.stageCaption}>
            <strong>{BRAND.name}</strong>
            <span>Kitchen essentials for every home</span>
          </div>
        </div>

        <div
          className={`${styles.content} ${styles.contentPanel} ${styles.reveal}`}
        >
          <p className="section-tag">Our Journey</p>
          <h2 className={styles.title}>
            Everyday kitchen tools, thoughtfully chosen
          </h2>
          <p className={styles.lead}>
            {BRAND.name} is {BRAND.brandOf}. We bring the essentials of Indian
            cooking to your kitchen — chakla, tawa, belan, serving spoons,
            spatulas, and mortar & pestle — built for daily use and lasting
            performance.
          </p>
          <p>
            From rolling dough to tempering spices, every product in our range
            is selected for comfort, finish, and real kitchen performance.
            Whether you cook for family or stock your store, you get tools that
            feel right in hand and hold up over time.
          </p>
          <p>
            Shop online with secure checkout, fast shipping, and support you can
            rely on — so your kitchen stays ready for every meal.
          </p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong>6</strong>
              <span>Core categories</span>
            </div>
            <div className={styles.stat}>
              <strong>Daily use</strong>
              <span>Built for kitchens</span>
            </div>
            <div className={styles.stat}>
              <strong>Pan-India</strong>
              <span>Ships nationwide</span>
            </div>
          </div>

          <div className={styles.ctaWrap}>
            <Link href="/shop" className={styles.cta}>
              Explore our products <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
