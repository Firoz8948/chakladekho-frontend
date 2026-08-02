import api from "./api";

export const getCategories = () => api.get("/categories/");

export const getCategoryBySlug = (slug) => api.get(`/categories/slug/${slug}`);

export const getCategoryProducts = (id, params) =>
  api.get(`/categories/${id}/products`, { params });
