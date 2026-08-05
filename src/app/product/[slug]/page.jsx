import JsonLd from "@/components/JsonLd/JsonLd";
import { API_BASE, API_URL } from "@/utils/constants";
import { mediaUrl } from "@/utils/mediaUrl";
import {
  OG_IMAGE,
  breadcrumbJsonLd,
  pageMetadata,
  productJsonLd,
  productSeoMeta,
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
  const meta = productSeoMeta(product, { imageUrl: image });

  if (!product.is_active) {
    return {
      ...meta,
      robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      },
    };
  }

  return meta;
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
          ...(product.category_slug
            ? [
                {
                  name: product.category,
                  path: `/shop?category=${product.category_slug}`,
                },
              ]
            : []),
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
