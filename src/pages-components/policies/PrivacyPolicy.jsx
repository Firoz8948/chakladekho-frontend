import PageHero from "@/components/PageHero/PageHero";
import { BRAND } from "@/utils/constants";
import styles from "./PrivacyPolicy.module.css";

export default function PrivacyPolicy() {
  const updated = "6 August 2026";

  return (
    <>
      <PageHero title="Privacy Policy">
        How {BRAND.name} collects, uses, and protects your personal information.
      </PageHero>

      <section className={`section ${styles.section}`}>
        <div className={`container ${styles.wrap}`}>
          <p className={styles.meta}>Last updated: {updated}</p>

          <div className={styles.block}>
            <h2>1. Who we are</h2>
            <p>
              {BRAND.name} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a product of{" "}
              {BRAND.legalEntity}. We sell kitchen essentials online across India.
              Our business is operated from {BRAND.address}. For privacy questions,
              contact us at{" "}
              <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or{" "}
              <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>{BRAND.phone}</a>.
            </p>
          </div>

          <div className={styles.block}>
            <h2>2. Information we collect</h2>
            <ul>
              <li>Name, phone number, and email address</li>
              <li>Delivery address and order details</li>
              <li>Payment status and transaction references (via Razorpay/COD)</li>
              <li>Device and usage data such as pages visited and cart activity</li>
              <li>Messages you send via contact form, WhatsApp, or email</li>
            </ul>
          </div>

          <div className={styles.block}>
            <h2>3. How we use your information</h2>
            <ul>
              <li>To process and deliver your orders</li>
              <li>To send order updates, invoices, and customer support replies</li>
              <li>To improve our website, products, and shopping experience</li>
              <li>To prevent fraud and keep payments secure</li>
              <li>To comply with legal and tax requirements in India</li>
            </ul>
          </div>

          <div className={styles.block}>
            <h2>4. Sharing of information</h2>
            <p>
              We do not sell your personal data. We may share limited information with:
            </p>
            <ul>
              <li>Payment providers (for example Razorpay) to complete transactions</li>
              <li>Shipping partners to deliver your order</li>
              <li>Service providers who host or maintain our website and systems</li>
              <li>Authorities when required by applicable law</li>
            </ul>
          </div>

          <div className={styles.block}>
            <h2>5. Cookies and analytics</h2>
            <p>
              We may use cookies and similar technologies for login sessions, cart
              memory, analytics, and advertising measurement (such as Meta Pixel).
              You can control cookies through your browser settings.
            </p>
          </div>

          <div className={styles.block}>
            <h2>6. Data security and retention</h2>
            <p>
              We use reasonable technical and organisational measures, including HTTPS,
              to protect your data. We keep order and customer records only as long as
              needed for business, legal, and accounting purposes.
            </p>
          </div>

          <div className={styles.block}>
            <h2>7. Your rights</h2>
            <p>
              You may request access, correction, or deletion of your personal data
              where applicable, by contacting {BRAND.email}. We may need to verify your
              identity before fulfilling the request.
            </p>
          </div>

          <div className={styles.block}>
            <h2>8. Updates</h2>
            <p>
              We may update this Privacy Policy from time to time. The latest version
              will always be published on this page with an updated date.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
