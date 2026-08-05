import JsonLd from "@/components/JsonLd/JsonLd";
import { API_BASE, API_URL } from "@/utils/constants";
import { mediaUrl } from "@/utils/mediaUrl";
import {
  OG_IMAGE,
  categorySeoMeta,
  collectionPageJsonLd,
  pageMetadata,
} from "@/utils/seo";

import ShopPageClient from "./ShopPageClient";

async function fetchCategory(slug) {
  if (!slug) return null;
  try {
    const res = await fetch(
      `${API_BASE}/categories/slug/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ searchParams }) {
  const categorySlug = searchParams?.category || "";
  const query = searchParams?.q || "";

  if (query) {
    return pageMetadata({
      title: `Search: ${query}`,
      description: `Search results for "${query}" on ChaklaDekho — kitchen essentials shipped across India.`,
      path: `/shop?q=${encodeURIComponent(query)}`,
      noIndex: true,
    });
  }

  if (categorySlug) {
    const category = await fetchCategory(categorySlug);
    if (category) {
      const image =
        mediaUrl(category.image_url, API_URL) || OG_IMAGE;
      return categorySeoMeta(category, { imageUrl: image });
    }
  }

  return pageMetadata({
    title: "Shop Kitchen Essentials",
    description:
      "Browse ChaklaDekho's range — chakla, tawa, belan, serving spoons, spatulas, and mortar & pestle. Quality kitchen tools shipped across India.",
    path: "/shop",
    keywords: [
      "shop kitchen essentials",
      "buy chakla online",
      "tawa",
      "belan",
      "ChaklaDekho",
    ],
  });
}

export default async function ShopPage({ searchParams }) {
  const categorySlug = searchParams?.category || "";
  const category = categorySlug ? await fetchCategory(categorySlug) : null;

  const schema = category
    ? collectionPageJsonLd({
        name: category.seo_title?.trim() || category.name,
        description:
          category.seo_description?.trim() ||
          category.description ||
          `Shop ${category.name} at ChaklaDekho`,
        path: `/shop?category=${category.slug}`,
      })
    : collectionPageJsonLd({
        name: "Shop Kitchen Essentials",
        description:
          "Browse ChaklaDekho kitchen essentials — chakla, tawa, belan, serving spoons, spatulas, and mortar & pestle.",
        path: "/shop",
      });

  return (
    <>
      <JsonLd data={schema} />
      <ShopPageClient />
    </>
  );
}
