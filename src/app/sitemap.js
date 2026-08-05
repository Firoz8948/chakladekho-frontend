import { API_BASE } from "@/utils/constants";
import { SITE_URL } from "@/utils/seo";

async function fetchJson(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchAllProductRoutes() {
  const routes = [];
  let page = 1;
  const pageSize = 100;

  while (page <= 30) {
    const data = await fetchJson(
      `/products/?page=${page}&page_size=${pageSize}&sort=newest`,
    );
    const items = data?.items || data || [];
    if (!Array.isArray(items) || items.length === 0) break;

    for (const product of items) {
      if (!product?.slug || product.is_active === false) continue;
      routes.push({
        url: `${SITE_URL}/product/${product.slug}`,
        lastModified: product.updated_at
          ? new Date(product.updated_at)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    const totalPages = data?.total_pages || data?.pages;
    if (totalPages && page >= totalPages) break;
    if (items.length < pageSize) break;
    page += 1;
  }

  return routes;
}

async function fetchCategoryRoutes() {
  const data = await fetchJson("/categories/");
  const categories = Array.isArray(data) ? data : data?.items || [];

  return categories
    .filter((cat) => cat?.slug && cat.is_active !== false && !cat.is_reels)
    .map((cat) => ({
      url: `${SITE_URL}/shop?category=${encodeURIComponent(cat.slug)}`,
      lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    }));
}

/** @type {import('next').MetadataRoute.Sitemap} */
export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/shop", priority: 0.95, changeFrequency: "daily" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.65, changeFrequency: "monthly" },
    { path: "/reels", priority: 0.6, changeFrequency: "weekly" },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const [productRoutes, categoryRoutes] = await Promise.all([
    fetchAllProductRoutes(),
    fetchCategoryRoutes(),
  ]);

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
