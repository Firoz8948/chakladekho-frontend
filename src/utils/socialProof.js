/**
 * Deterministic display rating/review counts (not real reviews).
 * Same product id always gets the same values.
 * Rating: 4.7 | 4.8 | 4.9 | 5.0
 * Reviews: 300–500 inclusive
 */
export function getProductSocialProof(id) {
  const n = Math.abs(Number(id) || 0);
  const ratings = [4.7, 4.8, 4.9, 5.0];
  const rating = ratings[n % ratings.length];
  const reviews = 300 + (Math.abs(n * 7919) % 201); // 300..500
  const ratingLabel = Number.isInteger(rating)
    ? `(${rating.toFixed(1)})`
    : `(${rating})`;
  return {
    rating,
    reviews,
    ratingLabel,
    label: `${reviews.toLocaleString("en-IN")} Reviews`,
  };
}
