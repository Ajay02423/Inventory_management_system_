import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Badge from "../components/Badge";
import PageHeader from "../components/PageHeader";
import { getOrder } from "../services/orders";
import { formatCurrency, formatDateTime } from "../utils";

function getStatusTone(status) {
  if (status === "CONFIRMED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={loading ? "Order Details" : `Order Details · ${order?.id}`}
        action={
          <button className="btn-secondary" type="button" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        }
      />

      {loading ? (
        <div className="panel p-6 text-sm text-ink/60">Loading order details...</div>
      ) : order ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="panel p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Customer</p>
              <h2 className="mt-3 text-2xl">{order.customer.full_name}</h2>
              <p className="mt-2 text-sm text-ink/65">{order.customer.email}</p>
              <p className="text-sm text-ink/65">{order.customer.phone}</p>
            </div>

            <div className="panel p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Order Meta</p>
              <div className="mt-4 space-y-3 text-sm text-ink/75">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">Order ID</span>
                  <span>{order.id}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">Date</span>
                  <span>{formatDateTime(order.order_date)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">Status</span>
                  <Badge tone={getStatusTone(order.status)}>{order.status}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="border-b border-ink/10 px-6 py-5">
              <h2 className="text-2xl">Order items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-ink/10 text-left">
                <thead className="bg-white/70 text-sm text-ink/55">
                  <tr>
                    <th className="px-4 py-4 font-semibold">Product Name</th>
                    <th className="px-4 py-4 font-semibold">SKU</th>
                    <th className="px-4 py-4 font-semibold">Qty</th>
                    <th className="px-4 py-4 font-semibold">Unit Price</th>
                    <th className="px-4 py-4 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-ink/5 bg-white/75 text-sm text-ink">
                      <td className="px-4 py-4 font-semibold">{item.product_name}</td>
                      <td className="px-4 py-4">{item.sku}</td>
                      <td className="px-4 py-4">{item.quantity}</td>
                      <td className="px-4 py-4">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-4 font-semibold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end border-t border-ink/10 px-6 py-5">
              <div className="rounded-2xl bg-ink px-5 py-4 text-white">
                <p className="text-sm text-white/70">Order total</p>
                <p className="text-2xl font-bold">{formatCurrency(order.total_amount)}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="panel p-6 text-sm text-ink/60">Order not found.</div>
      )}
    </div>
  );
}
