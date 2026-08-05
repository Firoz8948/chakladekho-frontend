import { ASSETS, BRAND } from "@/utils/constants";

/** Canonical production origin (no trailing slash) */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.chakladekho.com"
).replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Verified compatible: 2848×1504 (~1.89:1), ~155KB WebP */
export const OG_IMAGE =
  process.env.NEXT_PUBLIC_OG_IMAGE || absoluteUrl(ASSETS.ogImage);

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

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
export function socialImages(image = OG_IMAGE, alt = `${SITE_NAME} — Kitchen Essentials`) {
  return [
    {
      url: image,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt,
    },
  ];
}

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = OG_IMAGE,
  noIndex = false,
  keywords,
  type = "website",
}) {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;
  const desc = truncate(description);
  const imageAlt = `${title} | ${SITE_NAME}`;

  return {
    title: { absolute: fullTitle },
    description: desc,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type,
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description: desc,
      images: socialImages(image, imageAlt),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [image],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: { index: false, follow: false },
          },
        }
      : {}),
  };
}

/** Auto SEO for products when admin SEO fields are empty */
export function productSeoMeta(product, { imageUrl } = {}) {
  const title =
    product.seo_title?.trim() ||
    `${product.name} Online | Buy ${product.name}`;

  const description =
    product.seo_description?.trim() ||
    truncate(
      stripHtml(product.description || "") ||
        `Buy ${product.name} from ${SITE_NAME}. Quality kitchen essentials shipped across India.`,
      155,
    );

  const image = imageUrl || OG_IMAGE;
  const keywords = [
    product.name,
    product.category,
    ...(product.tags || []),
    "ChaklaDekho",
    "kitchen essentials",
    "buy online India",
  ].filter(Boolean);

  return pageMetadata({
    title,
    description,
    path: `/product/${product.slug}`,
    image,
    keywords,
    type: "website",
  });
}

/** Auto SEO for categories when admin SEO fields are empty */
export function categorySeoMeta(category, { imageUrl } = {}) {
  const name = category.name || "Category";
  const title =
    category.seo_title?.trim() ||
    `${name} | Shop ${name} Kitchen Essentials`;

  const description =
    category.seo_description?.trim() ||
    truncate(
      stripHtml(category.description || "") ||
        `Shop ${name} from ${SITE_NAME}. Quality kitchen tools with delivery across India.`,
      155,
    );

  return pageMetadata({
    title,
    description,
    path: `/shop?category=${encodeURIComponent(category.slug)}`,
    image: imageUrl || OG_IMAGE,
    keywords: [name, "ChaklaDekho", "kitchen essentials", "buy online"],
  });
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(ASSETS.logo),
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
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product, imageUrl) {
  const desc =
    truncate(
      product.seo_description?.trim() ||
        stripHtml(product.description || ""),
      300,
    ) || `${product.name} — kitchen essential from ${SITE_NAME}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.seo_title?.trim() || product.name,
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
      Date.now() + 90 * 24 * 60 * 60 * 1000,
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

export function collectionPageJsonLd({ name, description, path, items = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(items.length
      ? {
          mainEntity: {
            "@type": "ItemList",
            itemListElement: items.slice(0, 20).map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/product/${item.slug}`),
              name: item.name,
            })),
          },
        }
      : {}),
  };
}
