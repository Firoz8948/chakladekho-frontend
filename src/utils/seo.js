import { BRAND } from "@/utils/constants";

/** Canonical production origin (no trailing slash) */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://chakladkho.com"
).replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const OG_IMAGE =
  process.env.NEXT_PUBLIC_OG_IMAGE ||
  absoluteUrl("/assets/images/banners/herobanner.webp");

export const SITE_NAME = BRAND.name;

export const DEFAULT_DESCRIPTION =
  "Shop chakla, tawa, belan, serving spoons, spatulas, and mortar & pestle from ChaklaDekho. Quality kitchen essentials with free shipping across India.";

export function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text = "", max = 155) {
  const t = String(text).trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

/** Shared Open Graph + Twitter defaults */
export function socialImages(image = OG_IMAGE) {
  return [
    {
      url: image,
      width: 1200,
      height: 630,
      alt: `${SITE_NAME} — Kitchen Essentials`,
    },
  ];
}

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = OG_IMAGE,
  noIndex = false,
}) {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;

  return {
    title: { absolute: fullTitle },
    description: truncate(description),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description: truncate(description),
      images: socialImages(image),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: truncate(description),
      images: [image],
    },
    ...(noIndex
      ? { robots: { index: false, follow: false, googleBot: { index: false, follow: false } } }
      : {}),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/assets/images/logo/logo.svg"),
    image: OG_IMAGE,
    description: DEFAULT_DESCRIPTION,
    email: BRAND.email,
    telephone: BRAND.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND.address,
      addressCountry: "IN",
    },
    sameAs: [BRAND.instagram].filter(Boolean),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product, imageUrl) {
  const desc =
    truncate(stripHtml(product.description || ""), 300) ||
    `${product.name} — kitchen essential from ${SITE_NAME}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: desc,
    sku: String(product.id),
    url: absoluteUrl(`/product/${product.slug}`),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "INR",
      price: String(product.price ?? 0),
      availability:
        product.stock === 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (imageUrl) data.image = [imageUrl];
  if (product.category) data.category = product.category;
  if (product.mrp && product.mrp > product.price) {
    data.offers.priceValidUntil = new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 10);
  }

  return data;
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
