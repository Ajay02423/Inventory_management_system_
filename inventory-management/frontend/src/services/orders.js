import api, { extractApiError } from "./api";

export async function listOrders() {
  try {
    const response = await api.get("/api/orders");
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to load orders."));
  }
}

export async function getOrder(orderId) {
  try {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to load the order."));
  }
}

export async function createOrder(payload) {
  try {
    const response = await api.post("/api/orders", payload);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to create the order."));
  }
}

export async function cancelOrder(orderId) {
  try {
    const response = await api.delete(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to cancel the order."));
  }
}
