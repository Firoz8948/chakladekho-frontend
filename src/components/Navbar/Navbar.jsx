"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FiChevronDown,
  FiGrid,
  FiHome,
  FiInfo,
  FiInstagram,
  FiMenu,
  FiPhone,
  FiSearch,
  FiShoppingBag,
  FiShoppingCart,
  FiX,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import LoginModal from "@/components/LoginModal/LoginModal";
import ProfileModal from "@/components/ProfileModal/ProfileModal";
import MobileBottomNav from "@/components/MobileBottomNav/MobileBottomNav";
import Logo from "@/components/Logo/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { getCategories } from "@/services/categoryService";
import { BRAND } from "@/utils/constants";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function displayName(user) {
  const name = user?.name?.trim();
  if (name) return name.split(" ")[0];
  if (user?.phone) return user.phone.slice(-4).padStart(8, "•");
  return "there";
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, logout, user } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const userMenuRef = useRef(null);
  const desktopNavRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setCategoriesOpen((open) => (open ? false : open));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchParams.get("signin") === "1" && !isAuthenticated) {
      setLoginOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("signin");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [searchParams, isAuthenticated, pathname, router]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (
        desktopNavRef.current &&
        !desktopNavRef.current.contains(e.target)
      ) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const media = window.matchMedia("(max-width: 860px)");
    if (!media.matches) return undefined;

    const { body, documentElement } = document;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    if (drawerRef.current) drawerRef.current.scrollTop = 0;

    const preventTouchScroll = (e) => {
      if (drawerRef.current?.contains(e.target)) return;
      e.preventDefault();
    };

    document.addEventListener("touchmove", preventTouchScroll, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchmove", preventTouchScroll);
      body.style.overflow = prevBodyOverflow;
      documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [menuOpen]);

  // Keep closed drawer out of the accessibility / tab order (aria-hidden alone is not enough).
  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    if (menuOpen) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [menuOpen]);

  const headerClass = [styles.header, scrolled ? styles.scrolled : ""]
    .filter(Boolean)
    .join(" ");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
      setMenuOpen(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const renderLinks = (keyPrefix) =>
    NAV_LINKS.map((link) => {
      if (keyPrefix === "mobile" && link.href === "/shop") {
        return (
          <div key={`${keyPrefix}-shop`} className={styles.shopBlock}>
            <Link href="/shop" className={styles.navLink} onClick={closeMenu}>
              Shop
            </Link>
            <div className={styles.shopTree}>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className={styles.catLink}
                  onClick={closeMenu}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        );
      }

      return (
        <Link
          key={`${keyPrefix}-${link.href}`}
          href={link.href}
          className={styles.navLink}
          onClick={closeMenu}
        >
          {link.label}
        </Link>
      );
    });

  return (
    <>
      <header className={headerClass}>
        <div className={`container ${styles.inner}`}>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <Link href="/" className={styles.logo}>
            <Logo height={86} className={styles.logoImage} priority />
          </Link>

          <div
            ref={desktopNavRef}
            className={styles.desktopNavWrap}
            onKeyDown={(event) => {
              if (event.key === "Escape") setCategoriesOpen(false);
            }}
          >
            <nav className={styles.navDesktop} aria-label="Primary">
              <Link
                href="/"
                className={styles.navMenuItem}
                onMouseEnter={() => setCategoriesOpen(false)}
              >
                <FiHome size={16} aria-hidden="true" />
                <span>Home</span>
              </Link>

              <button
                type="button"
                className={styles.navMenuItem}
                onClick={() => setCategoriesOpen((open) => !open)}
                onMouseEnter={() => setCategoriesOpen(true)}
                aria-expanded={categoriesOpen}
                aria-controls="desktop-category-menu"
              >
                <FiGrid size={16} aria-hidden="true" />
                <span>Categories</span>
                <FiChevronDown
                  size={14}
                  aria-hidden="true"
                  className={`${styles.menuChevron} ${
                    categoriesOpen ? styles.menuChevronOpen : ""
                  }`}
                />
              </button>

              <Link
                href="/shop"
                className={styles.navMenuItem}
                onMouseEnter={() => setCategoriesOpen(false)}
              >
                <FiShoppingBag size={16} aria-hidden="true" />
                <span>Shop</span>
              </Link>

              <Link
                href="/contact"
                className={styles.navMenuItem}
                onMouseEnter={() => setCategoriesOpen(false)}
              >
                <FiPhone size={16} aria-hidden="true" />
                <span>Contact</span>
              </Link>
            </nav>

            {categoriesOpen ? (
              <div
                id="desktop-category-menu"
                className={styles.megaMenu}
                aria-label="Product categories"
              >
                <div className={`container ${styles.megaMenuInner}`}>
                  <div className={styles.megaMenuHeading}>
                    <div>
                      <span>Shop by category</span>
                      <strong>Find your kitchen essential</strong>
                    </div>
                    <Link href="/shop" onClick={() => setCategoriesOpen(false)}>
                      View all products <span aria-hidden="true">→</span>
                    </Link>
                  </div>

                  <div className={styles.megaMenuGrid}>
                    {categories.map((cat) => (
                      <div key={cat.id} className={styles.megaCategory}>
                        <Link
                          href={`/shop?category=${cat.slug}`}
                          className={styles.megaCategoryTitle}
                          onClick={() => setCategoriesOpen(false)}
                        >
                          <span>{cat.name}</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles.desktopRight}>
            <Link
              href="/about"
              className={`${styles.navMenuItem} ${styles.aboutDesktop}`}
              onMouseEnter={() => setCategoriesOpen(false)}
            >
              <FiInfo size={16} aria-hidden="true" />
              <span>About</span>
            </Link>

            <form className={styles.search} onSubmit={handleSearch}>
              <FiSearch className={styles.searchIcon} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search here..."
              />
            </form>

            <div className={styles.actions}>
            <Link
              href="/cart"
              className={`${styles.iconBtn} ${styles.cartBtn}`}
              aria-label="Cart"
              data-cart-target="desktop"
            >
              <FiShoppingCart size={22} strokeWidth={2.75} />
              {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
            </Link>

            {isAuthenticated ? (
              <div className={styles.userMenu} ref={userMenuRef}>
                <button
                  type="button"
                  className={styles.profileTrigger}
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <span className={styles.profileAvatar}>
                    {(user?.name || user?.phone || "U").charAt(0).toUpperCase()}
                  </span>
                  <span className={styles.profileGreeting}>
                    {displayName(user)}
                  </span>
                  <FiChevronDown
                    className={`${styles.chevron} ${userMenuOpen ? styles.chevronOpen : ""}`}
                    size={16}
                  />
                </button>

                {userMenuOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownName}>
                        {user?.name || `+91 ${user?.phone}`}
                      </span>
                      {user?.phone ? (
                        <span className={styles.dropdownEmail}>
                          +91 {user.phone}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(true);
                        setUserMenuOpen(false);
                      }}
                    >
                      Complete Profile
                    </button>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)}>
                      My Orders
                    </Link>
                    <button
                      type="button"
                      className={styles.signOutBtn}
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className={styles.loginBtn}
                onClick={() => setLoginOpen(true)}
              >
                Sign In
              </button>
            )}
            </div>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <button
          type="button"
          className={styles.navOverlay}
          aria-label="Close menu"
          onClick={closeMenu}
        />
      ) : null}

      <aside
        ref={drawerRef}
        className={`${styles.mobileDrawer} ${menuOpen ? styles.mobileDrawerOpen : ""}`}
        aria-hidden={!menuOpen}
        aria-label="Mobile menu"
      >
        <div className={styles.drawerBody}>
          {renderLinks("mobile")}
          <form className={styles.searchMobile} onSubmit={handleSearch}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search here..."
            />
            <button type="submit" aria-label="Search">
              <FiSearch />
            </button>
          </form>
        </div>
        <div className={styles.drawerFooter}>
          <div className={styles.drawerSocial}>
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FiInstagram size={18} />
            </a>
            <a
              href={`https://wa.me/${BRAND.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={18} />
            </a>
          </div>
          <p className={styles.drawerCopyright}>
            © {new Date().getFullYear()} ChaklaDekho. All rights reserved.
          </p>
        </div>
      </aside>

      <MobileBottomNav
        onProfileClick={() => {
          closeMenu();
          if (isAuthenticated) {
            setUserMenuOpen((v) => !v);
          } else {
            setLoginOpen(true);
          }
        }}
      />

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  );
}
