import api from "./api";

const CACHE_MS = 10000;
let cache = null;

/** Active free gift ({ title, image_url }) or null when disabled. */
export function fetchFreeGift({ fresh = false } = {}) {
  if (fresh || !cache || Date.now() - cache.at > CACHE_MS) {
    cache = {
      at: Date.now(),
      promise: api
        .get("/free-gift/")
        .then((res) => (res.data?.enabled ? res.data : null))
        .catch(() => null),
    };
  }
  return cache.promise;
}
