import PageHero from "@/components/PageHero/PageHero";
import { BRAND } from "@/utils/constants";
import styles from "./TermsOfService.module.css";

export default function TermsOfService() {
  const updated = "6 August 2026";

  return (
    <>
      <PageHero title="Terms of Service">
        The rules for using {BRAND.name} and buying from our online shop.
      </PageHero>

      <section className={`section ${styles.section}`}>
        <div className={`container ${styles.wrap}`}>
          <p className={styles.meta}>Last updated: {updated}</p>

          <div className={styles.block}>
            <h2>1. Agreement</h2>
            <p>
              By browsing or placing an order on {BRAND.name}, you agree to these
              Terms of Service and our Privacy Policy. If you do not agree, please do
              not use the website.
            </p>
          </div>

          <div className={styles.block}>
            <h2>2. About the seller</h2>
            <p>
              {BRAND.name} is {BRAND.brandOf}. We sell kitchen essentials such as
              chakla, tawa, belan, serving spoons, spatulas, and mortar &amp;
              pestle under the {BRAND.name} brand. Business contact:
            </p>
            <ul>
              <li>Brand: {BRAND.name}</li>
              <li>Business / seller: {BRAND.legalEntity}</li>
              <li>Address: {BRAND.address}</li>
              <li>Phone / WhatsApp: {BRAND.phone}</li>
              <li>Email: {BRAND.email}</li>
              <li>Hours: {BRAND.hours}</li>
            </ul>
          </div>

          <div className={styles.block}>
            <h2>3. Products and pricing</h2>
            <p>
              Product images are for illustration. Small variations in colour, finish,
              or size may occur. Prices are shown in INR and may change without prior
              notice. The price charged is the price shown at checkout when you place
              the order.
            </p>
          </div>

          <div className={styles.block}>
            <h2>4. Orders and payment</h2>
            <p>
              An order is confirmed after successful prepaid payment or after COD
              acceptance where available. We may cancel or refuse an order in cases of
              pricing errors, stock unavailability, suspected fraud, or delivery
              restrictions. Refunds for cancelled prepaid orders are processed as per
              our Shipping &amp; Returns policy.
            </p>
          </div>

          <div className={styles.block}>
            <h2>5. Account and communication</h2>
            <p>
              You agree to provide accurate contact and address details. We may contact
              you by phone, WhatsApp, SMS, or email about your order and related
              support.
            </p>
          </div>

          <div className={styles.block}>
            <h2>6. Acceptable use</h2>
            <p>
              You must not misuse the website, attempt unauthorised access, submit false
              orders, or use our content or branding without permission.
            </p>
          </div>

          <div className={styles.block}>
            <h2>7. Intellectual property</h2>
            <p>
              All website content, logos, product photography, and trademarks related to
              {BRAND.name} remain our property or that of our licensors and may not be
              copied for commercial use without written consent.
            </p>
          </div>

          <div className={styles.block}>
            <h2>8. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, {BRAND.name} is not liable for
              indirect or consequential losses arising from use of the website or
              products, except where liability cannot be excluded under Indian consumer
              protection laws.
            </p>
          </div>

          <div className={styles.block}>
            <h2>9. Governing law</h2>
            <p>
              These terms are governed by the laws of India. Courts in Maharashtra shall
              have jurisdiction, subject to applicable consumer protection rights.
            </p>
          </div>

          <div className={styles.block}>
            <h2>10. Contact</h2>
            <p>
              For questions about these terms, email{" "}
              <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or call{" "}
              <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>{BRAND.phone}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
