"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiFacebook,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTwitter,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import Logo from "@/components/Logo/Logo";
import { getCategories } from "@/services/categoryService";
import { BRAND } from "@/utils/constants";
import styles from "./Footer.module.css";

const WHATSAPP_URL = `https://wa.me/${BRAND.whatsapp}`;

export default function Footer() {
  const year = new Date().getFullYear();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <div className={styles.logoPlate}>
            <Logo height={104} className={styles.logo} />
          </div>
          <div className={styles.social}>
            <a href="#" aria-label="Facebook">
              <FiFacebook className={styles.outlineSocialIcon} />
            </a>
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FiInstagram className={styles.outlineSocialIcon} />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className={styles.filledSocialIcon} />
            </a>
            <a href="#" aria-label="Twitter">
              <FiTwitter className={styles.outlineSocialIcon} />
            </a>
          </div>
        </div>

        <div className={styles.col}>
          <h4>Shop</h4>
          <Link href="/shop">All Products</Link>
          <ul className={styles.shopList}>
            {categories.map((category) => (
              <li key={category.id} className={styles.shopCat}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className={styles.shopCatLink}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h4>Company</h4>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/orders">My Orders</Link>
          <Link href="/cart">Cart</Link>
        </div>

        <div className={styles.col}>
          <h4>Get in Touch</h4>
          <p className={styles.contactLine}>
            <FiMapPin
              className={styles.contactIcon}
              size={16}
              strokeWidth={2}
              aria-hidden
            />
            <span>
              Packaged and Managed by {BRAND.packagedBy}
              <br />
              {BRAND.address}
            </span>
          </p>
          <p className={styles.contactLine}>
            <FiPhone
              className={styles.contactIcon}
              size={16}
              strokeWidth={2}
              aria-hidden
            />
            <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>{BRAND.phone}</a>
          </p>
          <p className={styles.contactLine}>
            <FaWhatsapp className={styles.contactIcon} size={16} aria-hidden />
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              WhatsApp Us at {BRAND.whatsappDisplay}
            </a>
          </p>
          <p className={styles.contactLine}>
            <FiMail
              className={styles.contactIcon}
              size={16}
              strokeWidth={2}
              aria-hidden
            />
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          </p>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <p>
            © {year} ChaklaDekho
            <span className={styles.tm} title="Trademark" aria-label="Trademark">
              TM
            </span>{" "}
            Powered by SUPER STEEL CENTRE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
