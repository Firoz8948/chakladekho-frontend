/**
 * Web Share API with clipboard fallback.
 */
export async function shareLink({ title, text, url }) {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const payload = {
    title: title || "ChaklaDekho",
    text: text || title || "",
    url: shareUrl,
  };

  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share(payload);
      return { ok: true, method: "native" };
    }
  } catch (err) {
    if (err?.name === "AbortError") return { ok: false, method: "cancelled" };
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    return { ok: true, method: "clipboard" };
  } catch {
    return { ok: false, method: "failed" };
  }
}

export function productShareUrl(slug) {
  const base =
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://chakladkho.com";
  return `${base.replace(/\/$/, "")}/product/${slug}`;
}

export function videoShareUrl(id) {
  const base =
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://chakladkho.com";
  return `${base.replace(/\/$/, "")}/reels?v=${id}`;
}
