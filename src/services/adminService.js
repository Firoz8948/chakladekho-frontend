import adminApi from "./adminApi";

export const adminLogin = (username, password) =>
  adminApi.post("/admin/login", { username, password });

export const getAdminMe = () => adminApi.get("/admin/me");

export const updateAdminProfile = (data) =>
  adminApi.put("/admin/me/profile", data);

export const getDashboardStats = () => adminApi.get("/admin/dashboard/stats");

export const getAdminProducts = (params) =>
  adminApi.get("/admin/products", { params });

export const getAdminProduct = (id) => adminApi.get(`/admin/products/${id}`);

/** Lightweight product list for attach/mapping UIs (video products, etc.). */
export const getProductsForMapping = () =>
  adminApi
    .get("/admin/products", { params: { page: 1, limit: 100 } })
    .then((res) => ({
      ...res,
      data: (res.data?.products || []).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category || "",
        image: Array.isArray(p.images) && p.images[0] ? p.images[0] : null,
      })),
    }));

export const createProduct = (data) => adminApi.post("/admin/products", data);

export const updateProduct = (id, data) =>
  adminApi.put(`/admin/products/${id}`, data);

export const deleteProduct = (id) => adminApi.delete(`/admin/products/${id}`);

export const uploadProductImages = (id, formData) =>
  adminApi.post(`/admin/products/${id}/images`, formData, {
    timeout: 120000,
  });

export const removeProductImage = (id, imageUrl) =>
  adminApi.delete(`/admin/products/${id}/images`, {
    params: { image_url: imageUrl },
  });

export const getAdminOrders = (params) =>
  adminApi.get("/admin/orders", { params });

export const updateOrderStatus = (orderId, status) =>
  adminApi.put(`/admin/orders/${orderId}/status`, { status });

export const pushOrderToShiprocket = (orderId) =>
  adminApi.post(`/admin/orders/${orderId}/shiprocket`);

export const getAdminPayments = (params) =>
  adminApi.get("/admin/payments", { params });

export const refundAdminPayment = (paymentId, body = {}) =>
  adminApi.post(`/admin/payments/${paymentId}/refund`, body);

export const getAdminUsers = (params) =>
  adminApi.get("/admin/users/", { params });

export const getAdminCategories = () => adminApi.get("/categories/admin/all");

export const getPublicCategories = () => adminApi.get("/categories/");

export const getCategory = (id) => adminApi.get(`/categories/${id}`);

export const createCategory = (data) => adminApi.post("/categories/", data);

export const updateCategory = (id, data) => adminApi.put(`/categories/${id}`, data);

export const deleteCategory = (id) => adminApi.delete(`/categories/${id}`);

export const uploadCategoryImage = (id, formData) =>
  adminApi.post(`/categories/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getCategoryProducts = (id, params) =>
  adminApi.get(`/categories/${id}/products`, { params });

export const getAdminMetafields = () => adminApi.get("/metafields/admin/all");

export const createMetafield = (data) => adminApi.post("/metafields/", data);

export const updateMetafield = (id, data) => adminApi.put(`/metafields/${id}`, data);

export const deleteMetafield = (id) => adminApi.delete(`/metafields/${id}`);

// Video Products
export const getAdminVideoProducts = () => adminApi.get("/admin/video-products");

export const createVideoProduct = (formData) =>
  adminApi.post("/admin/video-products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateVideoProduct = (id, formData) =>
  adminApi.put(`/admin/video-products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteVideoProduct = (id) =>
  adminApi.delete(`/admin/video-products/${id}`);

// Banners
export const getAdminBanners = (device) =>
  adminApi.get("/banners/admin/all", { params: device ? { device } : {} });

export const createBanner = (data) => adminApi.post("/banners/", data);

export const updateBanner = (id, data) => adminApi.put(`/banners/${id}`, data);

export const deleteBanner = (id) => adminApi.delete(`/banners/${id}`);

export const uploadBannerImage = (id, formData) =>
  adminApi.post(`/banners/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Promo codes
export const getAdminPromoCodes = () => adminApi.get("/promocodes/admin/all");

export const getPromoCodeUsage = (id) =>
  adminApi.get(`/promocodes/admin/${id}/usage`);

export const createPromoCode = (data) => adminApi.post("/promocodes/", data);

export const updatePromoCode = (id, data) =>
  adminApi.put(`/promocodes/${id}`, data);

export const deletePromoCode = (id) => adminApi.delete(`/promocodes/${id}`);

export const validatePromoCode = (data) =>
  adminApi.post("/promocodes/validate", data);

// Shipping zones
export const getAdminShippingZones = () =>
  adminApi.get("/shipping-zones/admin/all");

export const createShippingZone = (data) =>
  adminApi.post("/shipping-zones/", data);

export const updateShippingZone = (id, data) =>
  adminApi.put(`/shipping-zones/${id}`, data);

export const deleteShippingZone = (id) =>
  adminApi.delete(`/shipping-zones/${id}`);

