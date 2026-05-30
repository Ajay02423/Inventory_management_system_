import api, { extractApiError } from "./api";

export async function listCustomers() {
  try {
    const response = await api.get("/api/customers");
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to load customers."));
  }
}

export async function createCustomer(payload) {
  try {
    const response = await api.post("/api/customers", payload);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to create customer."));
  }
}

export async function deleteCustomer(customerId) {
  try {
    await api.delete(`/api/customers/${customerId}`);
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to delete customer."));
  }
}

export async function getCustomerInsights(customerId) {
  try {
    const response = await api.get(`/api/customers/${customerId}/insights`);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to load customer insights."));
  }
}
