import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getOrdersChartData } from "../services/dashboard";

export default function DashboardOrdersChart() {
  const [period, setPeriod] = useState("7d");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const data = await getOrdersChartData(period);
        setChartData(data);
      } catch {
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [period]);

  return (
    <div className="panel p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink">Orders Overview</h3>
          <p className="mt-0.5 text-xs text-ink/50">
            {period === "24h" ? "Last 24 hours (hourly)" : "Last 7 days (daily)"}
          </p>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-ink/10">
          <button
            onClick={() => setPeriod("24h")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              period === "24h"
                ? "bg-brand-600 text-white"
                : "bg-white text-ink/60 hover:bg-brand-50 hover:text-ink"
            }`}
          >
            24 Hours
          </button>
          <button
            onClick={() => setPeriod("7d")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              period === "7d"
                ? "bg-brand-600 text-white"
                : "bg-white text-ink/60 hover:bg-brand-50 hover:text-ink"
            }`}
          >
            7 Days
          </button>
        </div>
      </div>

      <div className="h-[300px]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-ink/50">
            Loading chart...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-ink/50">
            No order data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,35,29,0.08)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(20,35,29,0.5)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(20,35,29,0.5)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid rgba(20,35,29,0.1)",
                  borderRadius: "8px",
                  color: "#14231d",
                  fontSize: "12px",
                }}
                cursor={{ fill: "rgba(20,35,29,0.05)" }}
                formatter={(value) => [value, "Orders"]}
              />
              <Bar dataKey="orders" fill="#3f8d4b" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
