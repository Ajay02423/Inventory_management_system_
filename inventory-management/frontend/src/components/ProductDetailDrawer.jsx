import { ImagePlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Badge from "./Badge";
import DetailFieldRow from "./DetailFieldRow";
import Drawer from "./Drawer";
import LoadingSpinner from "./LoadingSpinner";
import { getProductInsights } from "../services/products";
import { formatCurrency, formatDateTime, shortId } from "../utils";

const imagePlaceholder = "https://placehold.co/520x180/111827/9ca3af?text=No+Image";

export default function ProductDetailDrawer({ open, onClose, product, onEdit }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !product) {
      return;
    }

    const loadInsights = async () => {
      try {
        setLoading(true);
        const data = await getProductInsights(product.id);
        setInsights(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [open, product]);

  const imageSrc = useMemo(() => product?.image_url || imagePlaceholder, [product]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={product?.name || "Product details"}
      footer={
        product ? (
          <div className="flex justify-end">
            <button className="btn-primary" type="button" onClick={() => onEdit(product)}>
              Edit product
            </button>
          </div>
        ) : null
      }
    >
      {!product ? null : (
        <>
          <div className="border-b border-ink/10 pb-4">
            <h3 className="break-words text-lg font-bold leading-snug text-ink">{product.name}</h3>
            <p className="mt-1 break-all text-sm text-ink/55">{product.sku}</p>
            <div className="mt-2 inline-flex">
              <Badge tone={product.quantity < product.low_stock_threshold ? "danger" : "success"}>
                {product.quantity} in stock
              </Badge>
            </div>
          </div>

          <div
            className="w-full overflow-hidden rounded-xl border border-ink/10 bg-white/80"
            style={{ aspectRatio: "16/9", maxHeight: "180px" }}
          >
            <img
              src={imageSrc}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = imagePlaceholder;
              }}
            />
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <DetailFieldRow label="Description" value={product.description || "No description"} />
            <div className="mt-4">
              <DetailFieldRow label="Created" value={formatDateTime(product.created_at)} />
            </div>
            <div className="mt-4">
              <DetailFieldRow label="Updated" value={formatDateTime(product.updated_at)} />
            </div>
            <div className="mt-4">
              <DetailFieldRow label="Image URL" value={product.image_url || ""} valueClassName="break-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
              <p className="truncate text-xs text-ink/50">Price</p>
              <p className="mt-0.5 break-words text-base font-semibold text-ink">{formatCurrency(product.price)}</p>
            </div>
            <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
              <p className="truncate text-xs text-ink/50">Current Stock</p>
              <p className="mt-0.5 break-words text-base font-semibold text-ink">{product.quantity}</p>
            </div>
            <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
              <p className="truncate text-xs text-ink/50">Low Stock Threshold</p>
              <p className="mt-0.5 break-words text-base font-semibold text-ink">{product.low_stock_threshold}</p>
            </div>
            <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
              <p className="truncate text-xs text-ink/50">Stock Status</p>
              <p className="mt-0.5 break-words text-base font-semibold text-ink">
                {product.quantity < product.low_stock_threshold ? "Low stock" : "Healthy"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="min-w-0 flex-1 break-words text-lg font-bold leading-snug text-ink">Sales insights</h3>
              {loading ? <LoadingSpinner /> : null}
            </div>

            {insights ? (
              <>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
                    <p className="truncate text-xs text-ink/50">Last Ordered</p>
                    <p className="mt-0.5 break-words text-base font-semibold text-ink">{formatDateTime(insights.last_ordered_at)}</p>
                  </div>
                  <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
                    <p className="truncate text-xs text-ink/50">Total Orders</p>
                    <p className="mt-0.5 break-words text-base font-semibold text-ink">{insights.total_orders_count}</p>
                  </div>
                  <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
                    <p className="truncate text-xs text-ink/50">Quantity Sold</p>
                    <p className="mt-0.5 break-words text-base font-semibold text-ink">{insights.total_quantity_sold}</p>
                  </div>
                  <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
                    <p className="truncate text-xs text-ink/50">Revenue</p>
                    <p className="mt-0.5 break-words text-base font-semibold text-ink">{formatCurrency(insights.revenue_generated)}</p>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto rounded-xl border border-ink/10">
                  <table className="w-full table-fixed text-xs">
                    <thead>
                      <tr className="border-b border-ink/10 bg-black/5">
                        <th className="w-[35%] px-3 py-2 text-left font-medium text-ink/50">Order ID</th>
                        <th className="w-[25%] px-3 py-2 text-left font-medium text-ink/50">Date</th>
                        <th className="w-[20%] px-3 py-2 text-right font-medium text-ink/50">Qty</th>
                        <th className="w-[20%] px-3 py-2 text-left font-medium text-ink/50">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insights.recent_orders.length ? (
                        insights.recent_orders.map((order) => (
                          <tr key={order.id} className="border-b border-ink/5 text-xs text-ink last:border-0 hover:bg-black/5">
                            <td className="truncate px-3 py-2 font-mono">{`${shortId(order.id)}...`}</td>
                            <td className="px-3 py-2">{formatDateTime(order.order_date)}</td>
                            <td className="px-3 py-2 text-right">{order.quantity}</td>
                            <td className="px-3 py-2">
                              <Badge tone={order.status === "CANCELLED" ? "danger" : "success"}>{order.status}</Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-4 text-xs text-ink/50" colSpan={4}>
                            No recent orders for this product.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <button className="btn-secondary w-full" type="button" onClick={() => onEdit(product)}>
              <ImagePlus className="h-4 w-4" />
              Upload Image
            </button>
          </div>
        </>
      )}
    </Drawer>
  );
}
