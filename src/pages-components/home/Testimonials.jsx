"use client";

import { FiStar } from "react-icons/fi";
import styles from "./Testimonials.module.css";

const REVIEWS_ROW1 = [
  {
    name: "Kavita Deshmukh",
    city: "Nagpur",
    rating: 5,
    text: "The chakla and belan set is perfectly balanced. Rolling rotis is so much easier now. Great quality!",
  },
  {
    name: "Ankit Bhatt",
    city: "Surat",
    rating: 5,
    text: "Love the tawa — heats evenly and my rotis come out soft every time. Fast delivery too.",
  },
  {
    name: "Farah Qureshi",
    city: "Lucknow",
    rating: 5,
    text: "Ordered serving spoons and spatulas in bulk for our kitchen. Solid build and fair pricing.",
  },
  {
    name: "Rohan Iyer",
    city: "Bengaluru",
    rating: 4,
    text: "The mortar and pestle feels sturdy and traditional. Perfect for grinding masalas at home.",
  },
  {
    name: "Neha Kulkarni",
    city: "Indore",
    rating: 5,
    text: "Belan arrived well packed with a smooth finish. Exactly what I needed for my kitchen setup.",
  },
  {
    name: "Siddharth Menon",
    city: "Hyderabad",
    rating: 5,
    text: "Superb chakla — flat, sturdy, and easy to clean. Will order more gifts from ChaklaDekho.",
  },
];

function StarRating({ rating }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          fill={i < rating ? "var(--color-gold)" : "none"}
          color="var(--color-gold)"
          size={14}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className={styles.card}>
      <StarRating rating={review.rating} />
      <p className={styles.text}>&ldquo;{review.text}&rdquo;</p>
      <div className={styles.author}>
        <div>
          <strong>{review.name}</strong>
          <span>{review.city}</span>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className={`section ${styles.wrap}`}>
      <div className="container">
        <h2 className="section-title">What Our Customers Say</h2>
        <p className="section-subtitle">Feedback from home cooks across India</p>
      </div>

      <div className={styles.marqueeOuter}>
        <div className={`${styles.marqueeTrack} ${styles.marqueeLeft}`}>
          <div className={styles.marqueeGroup}>
            {REVIEWS_ROW1.map((r) => (
              <ReviewCard key={`a-${r.name}`} review={r} />
            ))}
          </div>
          <div className={styles.marqueeGroup} aria-hidden>
            {REVIEWS_ROW1.map((r) => (
              <ReviewCard key={`b-${r.name}`} review={r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
