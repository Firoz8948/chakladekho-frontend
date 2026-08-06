import PageHero from "@/components/PageHero/PageHero";
import { BRAND } from "@/utils/constants";
import styles from "./ShippingReturns.module.css";

export default function ShippingReturns() {
  const updated = "6 August 2026";

  return (
    <>
      <PageHero title="Shipping & Returns">
        Delivery timelines, shipping charges, returns, and refund rules for{" "}
        {BRAND.name}.
      </PageHero>

      <section className={`section ${styles.section}`}>
        <div className={`container ${styles.wrap}`}>
          <p className={styles.meta}>Last updated: {updated}</p>

          <div className={styles.block}>
            <h2>1. Shipping coverage</h2>
            <p>
              We ship kitchen essentials across India. Delivery availability and charges
              may vary by pincode and order value. Exact options are shown at checkout
              after you enter your delivery pin code.
            </p>
          </div>

          <div className={styles.block}>
            <h2>2. Processing and delivery time</h2>
            <ul>
              <li>Orders are usually processed within 1–2 business days</li>
              <li>Standard delivery typically takes 3–8 business days after dispatch</li>
              <li>Remote locations may take longer due to courier serviceability</li>
            </ul>
            <p>
              Delivery estimates are indicative and may change due to courier delays,
              holidays, weather, or incorrect address details.
            </p>
          </div>

          <div className={styles.block}>
            <h2>3. Shipping charges</h2>
            <p>
              Shipping fees (prepaid or COD, where offered) are calculated at checkout.
              Free shipping may apply on selected offers or order values when shown on
              the site.
            </p>
          </div>

          <div className={styles.block}>
            <h2>4. Order tracking</h2>
            <p>
              Once your order is shipped, tracking details (where available) are shared
              by SMS, WhatsApp, email, or in your Orders section. For help, contact{" "}
              <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or{" "}
              <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>{BRAND.phone}</a>.
            </p>
          </div>

          <div className={styles.block}>
            <h2>5. Returns eligibility</h2>
            <p>You may request a return if:</p>
            <ul>
              <li>The product is damaged in transit</li>
              <li>You received a wrong or missing item</li>
              <li>There is a manufacturing defect reported promptly after delivery</li>
            </ul>
            <p>
              Return requests should generally be raised within 7 days of delivery with
              clear photos/videos and your order ID.
            </p>
          </div>

          <div className={styles.block}>
            <h2>6. Non-returnable cases</h2>
            <ul>
              <li>Products damaged due to misuse or normal wear</li>
              <li>Orders refused without a valid delivery issue</li>
              <li>Requests made after the return window without a valid reason</li>
            </ul>
          </div>

          <div className={styles.block}>
            <h2>7. Refunds</h2>
            <p>
              After a return is approved and the product is received/inspected (where
              required):
            </p>
            <ul>
              <li>
                Prepaid orders are refunded to the original payment method, usually
                within 5–10 business days depending on your bank/payment provider
              </li>
              <li>
                COD refunds may be issued by bank transfer/UPI once account details are
                shared and verified
              </li>
            </ul>
            <p>
              Shipping charges may be non-refundable unless the return is due to our
              error or a defective/damaged product.
            </p>
          </div>

          <div className={styles.block}>
            <h2>8. Cancellations</h2>
            <p>
              You may request cancellation before the order is shipped. Once shipped,
              cancellation may not be possible and the return process applies instead.
            </p>
          </div>

          <div className={styles.block}>
            <h2>9. Contact for delivery or returns</h2>
            <ul>
              <li>Email: {BRAND.email}</li>
              <li>Phone / WhatsApp: {BRAND.phone}</li>
              <li>Address: {BRAND.address}</li>
              <li>Hours: {BRAND.hours}</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
