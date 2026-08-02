import { BRAND } from "@/utils/constants";
import styles from "./ContactMap.module.css";

const embedQuery = encodeURIComponent(BRAND.address);
const embedSrc = `https://maps.google.com/maps?q=${embedQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

export default function ContactMap() {
  return (
    <section className={styles.section} aria-label="Store location map">
      <div className="container">
        <h2 className="section-title">Find Us</h2>
        <p className="section-subtitle">
          Visit us in Nalasopara West, Vasai-Virar
        </p>

        <div className={styles.mapWrap}>
          <iframe
            title="ChaklaDekho shop location"
            src={embedSrc}
            className={styles.map}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <a
          href={BRAND.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapsLink}
        >
          Open in Google Maps →
        </a>
      </div>
    </section>
  );
}
