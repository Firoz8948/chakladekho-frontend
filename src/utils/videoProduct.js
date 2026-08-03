/**
 * Shared helpers for the "video products" storefront feature
 * (home row + reels experience).
 */

export const VIDEO_PRODUCTS_ENDPOINT = `${
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api/v1"
}/video-products`;

export async function fetchVideoProducts() {
  try {
    const res = await fetch(VIDEO_PRODUCTS_ENDPOINT, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Map a video-product API item to the shape expected by CartContext/addToCart. */
export function toCartProduct(item) {
  return {
    id: item.product_id || item.id,
    name: item.name,
    price: item.price,
    mrp: item.mrp,
    slug: item.product_id ? `product-${item.product_id}` : item.slug || `video-${item.id}`,
    images: item.images || [],
    stock: item.stock,
    weight: item.weight,
    length_cm: item.length_cm,
    breadth_cm: item.breadth_cm,
    height_cm: item.height_cm,
  };
}

/** Options passed alongside addToCart / Buy Now for shipping dims. */
export function videoCartOptions(item) {
  return {
    price: item.price,
    mrp: item.mrp,
    stock: item.stock,
    weightGrams: item.weight,
    length_cm: item.length_cm,
    breadth_cm: item.breadth_cm,
    height_cm: item.height_cm,
  };
}
