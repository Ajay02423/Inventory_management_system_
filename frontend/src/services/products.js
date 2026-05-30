import api, { extractApiError } from "./api";

export async function listProducts() {
  try {
    const response = await api.get("/api/products");
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to load products."));
  }
}

export async function createProduct(payload) {
  try {
    const response = await api.post("/api/products", payload);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to create product."));
  }
}

export async function updateProduct(productId, payload) {
  try {
    const response = await api.put(`/api/products/${productId}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to update product."));
  }
}

export async function deleteProduct(productId) {
  try {
    await api.delete(`/api/products/${productId}`);
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to delete product."));
  }
}

export async function getProductInsights(productId) {
  try {
    const response = await api.get(`/api/products/${productId}/insights`);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to load product insights."));
  }
}
