import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Badge from "./Badge";
import DetailFieldRow from "./DetailFieldRow";
import Drawer from "./Drawer";
import LoadingSpinner from "./LoadingSpinner";
import { getOrder } from "../services/orders";
import { formatCurrency, formatDateTime, shortId } from "../utils";

function getStatusTone(status) {
  if (status === "CONFIRMED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

export default function OrderDetailDrawer({ open, onClose, orderId }) {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !orderId) {
      return;
    }

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
  }, [open, orderId]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={order ? `Order ${shortId(order.id)}` : "Order details"}
      footer={
        order ? (
          <div className="flex justify-end">
            <button className="btn-primary" type="button" onClick={() => navigate(`/orders/${order.id}`)}>
              <ExternalLink className="h-4 w-4" />
              View Full Details
            </button>
          </div>
        ) : null
      }
    >
      {loading ? (
        <div className="flex items-center gap-3 text-sm text-ink/60">
          <LoadingSpinner />
          Loading order details...
        </div>
      ) : order ? (
        <>
          <div className="border-b border-ink/10 pb-4">
            <div className="flex min-w-0 items-start gap-2">
              <h3 className="min-w-0 flex-1 break-words text-lg font-bold leading-snug text-ink">{`Order ${shortId(order.id)}`}</h3>
              <div className="flex-shrink-0">
                <Badge tone={getStatusTone(order.status)}>{order.status}</Badge>
              </div>
            </div>
            <p className="mt-1 break-all text-sm text-ink/55">{order.id}</p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <DetailFieldRow label="Order ID" value={order.id} valueClassName="break-all" />
            <div className="mt-4">
              <DetailFieldRow label="Customer" value={order.customer.full_name} valueClassName="truncate" />
            </div>
            <div className="mt-4">
              <DetailFieldRow label="Email" value={order.customer.email} valueClassName="break-all" />
            </div>
            <div className="mt-4">
              <DetailFieldRow label="Order Date" value={formatDateTime(order.order_date)} />
            </div>
            <div className="mt-4">
              <DetailFieldRow
                label="Status"
                value={<Badge tone={getStatusTone(order.status)}>{order.status}</Badge>}
                valueClassName="break-words"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
              <p className="truncate text-xs text-ink/50">Items</p>
              <p className="mt-0.5 break-words text-base font-semibold text-ink">{order.items.length}</p>
            </div>
            <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
              <p className="truncate text-xs text-ink/50">Order Total</p>
              <p className="mt-0.5 break-words text-base font-semibold text-ink">{formatCurrency(order.total_amount)}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full table-fixed text-xs">
              <thead>
                <tr className="border-b border-ink/10 bg-black/5">
                  <th className="w-[30%] px-3 py-2 text-left font-medium text-ink/50">Product</th>
                  <th className="w-[20%] px-3 py-2 text-left font-medium text-ink/50">SKU</th>
                  <th className="w-[12%] px-3 py-2 text-right font-medium text-ink/50">Qty</th>
                  <th className="w-[18%] px-3 py-2 text-right font-medium text-ink/50">Price</th>
                  <th className="w-[20%] px-3 py-2 text-right font-medium text-ink/50">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-ink/5 text-xs text-ink last:border-0 hover:bg-black/5">
                    <td className="truncate px-3 py-2 font-semibold">{item.product_name}</td>
                    <td className="truncate px-3 py-2">{item.sku}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </Drawer>
  );
}
