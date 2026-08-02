import { FiHome, FiTag, FiThumbsUp, FiTruck } from "react-icons/fi";

import styles from "./WhyChooseUs.module.css";

const FEATURES = [
  { icon: FiHome, title: "Kitchen Essential", text: "Everyday tools chosen for strength, finish, and real kitchen use." },
  { icon: FiTruck, title: "Fast Delivery", text: "Quick and safe doorstep delivery across India." },
  { icon: FiTag, title: "Best Price", text: "Quality kitchen tools at prices that make sense for every home." },
  { icon: FiThumbsUp, title: "Customer Satisfaction", text: "Trusted by happy customers who come back for more." },
];

export default function WhyChooseUs() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Why Choose Us</h2>
        <p className="section-subtitle">Kitchen tools made to perform, service you can trust</p>

        <div className={styles.scrollWrap}>
          <div className={styles.grid}>
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className={styles.card}>
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
