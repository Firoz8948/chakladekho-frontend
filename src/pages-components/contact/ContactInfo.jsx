import { FiBriefcase, FiClock, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

import { BRAND } from "@/utils/constants";
import styles from "./ContactInfo.module.css";

export default function ContactInfo() {
  const items = [
    {
      icon: FiBriefcase,
      label: "Seller",
      value: `${BRAND.name} — ${BRAND.brandOf}`,
    },
    { icon: FiMapPin, label: "Address", value: BRAND.address },
    { icon: FiPhone, label: "Phone", value: BRAND.phone },
    { icon: FiMail, label: "Email", value: BRAND.email },
    { icon: FiClock, label: "Hours", value: BRAND.hours },
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className={styles.item}>
            <span className={styles.icon}>
              <Icon size={20} />
            </span>
            <div>
              <strong>{label}</strong>
              <span>{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
