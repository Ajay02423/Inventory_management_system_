import { Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Badge from "./Badge";
import DetailFieldRow from "./DetailFieldRow";
import Drawer from "./Drawer";
import LoadingSpinner from "./LoadingSpinner";
import { getCustomerInsights } from "../services/customers";
import { formatCurrency, formatDate, formatDateTime, shortId } from "../utils";

export default function CustomerDetailDrawer({ open, onClose, customer }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !customer) {
      return;
    }

    const loadInsights = async () => {
      try {
        setLoading(true);
        const data = await getCustomerInsights(customer.id);
        setInsights(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [open, customer]);

  return (
    <Drawer open={open} onClose={onClose} title={customer?.full_name || "Customer details"}>
      {!customer ? null : (
        <>
          <div className="border-b border-ink/10 pb-4">
            <h3 className="break-words text-lg font-bold leading-snug text-ink">{customer.full_name}</h3>
            <p className="mt-1 break-all text-sm text-ink/55">{customer.email}</p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <DetailFieldRow
              label="Email"
              value={
                <a className="inline-flex items-center gap-2 text-brand-900 hover:underline" href={`mailto:${customer.email}`}>
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="break-all">{customer.email}</span>
                </a>
              }
              valueClassName="break-all"
            />
            <div className="mt-4">
              <DetailFieldRow
                label="Phone"
                value={
                  <a className="inline-flex items-center gap-2 text-brand-900 hover:underline" href={`tel:${customer.phone}`}>
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="break-all">{customer.phone}</span>
                  </a>
                }
                valueClassName="break-all"
              />
            </div>
            <div className="mt-4">
              <DetailFieldRow label="Member Since" value={formatDate(customer.created_at)} />
            </div>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="min-w-0 flex-1 break-words text-lg font-bold leading-snug text-ink">Customer insights</h3>
              {loading ? <LoadingSpinner /> : null}
            </div>

            {insights ? (
              <>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
                    <p className="truncate text-xs text-ink/50">Total Orders</p>
                    <p className="mt-0.5 break-words text-base font-semibold text-ink">{insights.total_orders}</p>
                  </div>
                  <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
                    <p className="truncate text-xs text-ink/50">Total Spent</p>
                    <p className="mt-0.5 break-words text-base font-semibold text-ink">{formatCurrency(insights.total_spent)}</p>
                  </div>
                  <div className="min-w-0 rounded-xl border border-ink/10 bg-white/80 p-3">
                    <p className="truncate text-xs text-ink/50">Last Order</p>
                    <p className="mt-0.5 break-words text-base font-semibold text-ink">{formatDateTime(insights.last_order_date)}</p>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto rounded-xl border border-ink/10">
                  <table className="w-full table-fixed text-xs">
                    <thead>
                      <tr className="border-b border-ink/10 bg-black/5">
                        <th className="w-[35%] px-3 py-2 text-left font-medium text-ink/50">Order ID</th>
                        <th className="w-[25%] px-3 py-2 text-left font-medium text-ink/50">Date</th>
                        <th className="w-[20%] px-3 py-2 text-right font-medium text-ink/50">Total</th>
                        <th className="w-[20%] px-3 py-2 text-left font-medium text-ink/50">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insights.recent_orders.length ? (
                        insights.recent_orders.map((order) => (
                          <tr key={order.id} className="border-b border-ink/5 text-xs text-ink last:border-0 hover:bg-black/5">
                            <td className="truncate px-3 py-2 font-mono">{`${shortId(order.id)}...`}</td>
                            <td className="px-3 py-2">{formatDateTime(order.order_date)}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(order.total_amount)}</td>
                            <td className="px-3 py-2">
                              <Badge tone={order.status === "CANCELLED" ? "danger" : "success"}>{order.status}</Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-4 text-xs text-ink/50" colSpan={4}>
                            No orders found for this customer.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </div>
        </>
      )}
    </Drawer>
  );
}
