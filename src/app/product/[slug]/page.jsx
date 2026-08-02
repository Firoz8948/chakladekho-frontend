import JsonLd from "@/components/JsonLd/JsonLd";
import { API_BASE, API_URL } from "@/utils/constants";
import { mediaUrl } from "@/utils/mediaUrl";
import {
  OG_IMAGE,
  breadcrumbJsonLd,
  pageMetadata,
  productJsonLd,
  stripHtml,
  truncate,
} from "@/utils/seo";

import ProductPageClient from "./ProductPageClient";

async function fetchProduct(slug) {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.slug);

  if (!product) {
    return pageMetadata({
      title: "Product not found",
      description: "This product is unavailable.",
      path: `/product/${params.slug}`,
      noIndex: true,
    });
  }

  const image = mediaUrl(product.images?.[0], API_URL) || OG_IMAGE;
  const description =
    truncate(stripHtml(product.description || ""), 155) ||
    `Buy ${product.name} from ChaklaDekho — quality kitchen essentials. Ships across India.`;

  return pageMetadata({
    title: product.name,
    description,
    path: `/product/${product.slug}`,
    image,
  });
}

export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.slug);
  const image = product
    ? mediaUrl(product.images?.[0], API_URL) || OG_IMAGE
    : null;

  const schemas = product
    ? [
        productJsonLd(product, image),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: product.name, path: `/product/${product.slug}` },
        ]),
      ]
    : null;

  return (
    <>
      {schemas ? <JsonLd data={schemas} /> : null}
      <ProductPageClient slug={params.slug} />
    </>
  );
}
