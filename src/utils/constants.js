export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api/v1";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

export const BRAND = {
  name: "ChaklaDekho",
  tagline: "Kitchen Essentials for Every Home",
  phone: "+91 96991 64131",
  whatsapp: "919699164131",
  whatsappDisplay: "+91 96991 64131",
  email: "brjangu29@gmail.com",
  address:
    "Umadevi mandir, Umrale, Samel Pada, Nalasopara West, Vasai-Virar, Maharashtra 401203",
  /** Legal / parent business behind the ChaklaDekho brand */
  legalEntity: "SUPER STEEL CENTRE",
  brandOf: "ChaklaDekho is a product of SUPER STEEL CENTRE.",
  packagedBy: "ChaklaDekho",
  hours: "Daily: 9:00 AM - 8:00 PM",
  mapsUrl: "https://maps.app.goo.gl/6vu33aYvzsYzrq4YA",
  instagram: "https://www.instagram.com/",
};

export const ASSETS = {
  logo: "/assets/images/logo/logo.svg",
  icon: "/assets/images/logo/icon.svg",
  ogImage: "/assets/images/logo/ogimage.webp",
  heroVideo: "/assets/videos/hero.mp4",
  heroBanner: "/assets/images/banners/herobanner.webp",
  aboutStory: "/assets/images/banners/about.webp",
  owner: "/assets/images/banners/owner.jpeg",
  images: {
    banners: "/assets/images/banners",
    products: "/assets/images/products",
    icons: "/assets/images/icons",
    logo: "/assets/images/logo",
  },
  videos: "/assets/videos",
};

export const CATEGORIES = [
  { name: "Chakla", slug: "chakla" },
  { name: "Tawa", slug: "tawa" },
  { name: "Belan / Rolling Pin", slug: "belan-rolling-pin" },
  { name: "Serving Spoon", slug: "serving-spoon" },
  { name: "Spatula", slug: "spatula" },
  { name: "Mortar and Pestle", slug: "mortar-and-pestle" },
];

export const ORDER_STATUS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const FREE_SHIPPING_THRESHOLD = 999;
export const FLAT_SHIPPING_CHARGE = 49;

export const TOKEN_COOKIE = "access_token";
export const CART_STORAGE_KEY = "chakladkho_cart";
export const LAST_ORDER_KEY = "chakladkho_last_order";
