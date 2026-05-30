import api, { extractApiError } from "./api";

export async function getDashboardSummary() {
  try {
    const response = await api.get("/api/dashboard");
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to load the dashboard."));
  }
}

export async function getOrdersChartData(period = "7d") {
  try {
    const response = await api.get(`/api/dashboard/orders-chart?period=${period}`);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Unable to load the orders chart."));
  }
}
