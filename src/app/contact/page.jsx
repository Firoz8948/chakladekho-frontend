import { ContactForm, ContactHero, ContactInfo, ContactMap } from "@/pages-components/contact";
import { pageMetadata } from "@/utils/seo";
import styles from "./contact.module.css";

export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Contact ChaklaDekho in Nalasopara West. Call +91 96991 64131 or WhatsApp for kitchen essentials orders across India.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <div className="container section">
        <div className={styles.grid}>
          <div className={styles.infoCol}>
            <ContactInfo />
          </div>
          <div className={styles.formCol}>
            <ContactForm />
          </div>
        </div>
      </div>
      <ContactMap />
    </>
  );
}
