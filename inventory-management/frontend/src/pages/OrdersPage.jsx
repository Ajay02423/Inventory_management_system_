import { Download, Eye, Plus, Trash2 } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Badge from "../components/Badge";
import ConfirmDialog from "../components/ConfirmDialog";
import FilterToggleButton from "../components/FilterToggleButton";
import OrderDetailDrawer from "../components/OrderDetailDrawer";
import OrderWizardModal from "../components/OrderWizardModal";
import PageHeader from "../components/PageHeader";
import PaginationControls from "../components/PaginationControls";
import SearchInput from "../components/SearchInput";
import SortableHeader from "../components/SortableHeader";
import TableFiltersRow from "../components/TableFiltersRow";
import TableState from "../components/TableState";
import useDataTable from "../hooks/useDataTable";
import { listCustomers } from "../services/customers";
import { cancelOrder, createOrder, listOrders } from "../services/orders";
import { listProducts } from "../services/products";
import {
  buildExportFilename,
  downloadCSV,
  formatCurrency,
  formatDateTime,
  shortId,
} from "../utils";

const initialFilters = {
  id: "",
  customer: "",
  totalMin: "",
  totalMax: "",
  status: "ALL",
  dateFrom: "",
  dateTo: "",
};

function getStatusTone(status) {
  if (status === "CONFIRMED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

function inNumberRange(value, min, max) {
  if (min !== "" && Number(value) < Number(min)) return false;
  if (max !== "" && Number(value) > Number(max)) return false;
  return true;
}

function inDateRange(value, from, to) {
  if (!from && !to) return true;
  const date = new Date(value);
  if (from && date < new Date(from)) return false;
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (date > end) return false;
  }
  return true;
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, customersData, productsData] = await Promise.all([
        listOrders(),
        listCustomers(),
        listProducts(),
      ]);

      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const table = useDataTable({
    items: orders,
    search: deferredSearch,
    searchFields: ["id", "customer_name"],
    filterState: filters,
    filterFn: (order, currentFilters) =>
      order.id.toLowerCase().includes(currentFilters.id.toLowerCase()) &&
      order.customer_name.toLowerCase().includes(currentFilters.customer.toLowerCase()) &&
      inNumberRange(order.total_amount, currentFilters.totalMin, currentFilters.totalMax) &&
      (currentFilters.status === "ALL" || order.status === currentFilters.status) &&
      inDateRange(order.order_date, currentFilters.dateFrom, currentFilters.dateTo),
    sortAccessors: {
      id: (order) => order.id,
      customer_name: (order) => order.customer_name,
      total_amount: (order) => Number(order.total_amount),
      status: (order) => order.status,
      order_date: (order) => order.order_date,
    },
  });

  const handleCreateOrder = async (payload) => {
    try {
      setSubmitting(true);
      await createOrder(payload);
      toast.success("Order created successfully.");
      setWizardOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelTarget) {
      return;
    }

    try {
      setCancelling(true);
      await cancelOrder(cancelTarget.id);
      toast.success("Order cancelled and stock restored.");
      setCancelTarget(null);
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCancelling(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setSearch("");
    setFilters(initialFilters);
  };

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(
        ([key, value]) =>
          value !== "" &&
          value !== null &&
          value !== undefined &&
          !(key === "status" && value === "ALL")
      ).length,
    [filters]
  );

  const canCreateOrder = customers.length > 0 && products.length > 0;

  const exportRows = useMemo(
    () =>
      table.filteredItems.map((order) => ({
        "Order ID": order.id,
        "Customer Name": order.customer_name,
        "Total Amount (INR)": order.total_amount,
        Status: order.status,
        "Order Date": formatDateTime(order.order_date),
        "Item Count": order.item_count,
      })),
    [table.filteredItems]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        action={
          <button className="btn-primary" type="button" onClick={() => setWizardOpen(true)} disabled={!canCreateOrder}>
            <Plus className="h-4 w-4" />
            New Order
          </button>
        }
      />

      {!canCreateOrder ? (
        <div className="rounded-3xl border border-accent-200 bg-accent-50 p-4 text-sm text-accent-900">
          Add at least one customer and one product before creating a new order.
        </div>
      ) : null}

      <div className="panel p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by order ID or customer name" />
          </div>
          <div className="flex flex-wrap gap-3">
            <FilterToggleButton
              showFilters={showFilters}
              activeFilterCount={activeFilterCount}
              onClick={() => setShowFilters((current) => !current)}
            />
            <button
              className="btn-secondary"
              type="button"
              onClick={() => downloadCSV(exportRows, buildExportFilename("orders"))}
              disabled={!exportRows.length}
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink/10 text-left">
            <thead className="bg-white/70 text-sm text-ink/55">
              <tr>
                <th className="px-4 py-4"><SortableHeader label="Order ID" sortKey="id" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Customer" sortKey="customer_name" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4 font-semibold">Items</th>
                <th className="px-4 py-4"><SortableHeader label="Total" sortKey="total_amount" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Status" sortKey="status" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Order Date" sortKey="order_date" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4 text-right font-semibold">Actions</th>
              </tr>
              {showFilters ? (
                <TableFiltersRow
                  filters={[
                    { key: "id", type: "text", value: filters.id, onChange: (value) => updateFilter("id", value) },
                    { key: "customer", type: "text", value: filters.customer, onChange: (value) => updateFilter("customer", value) },
                    null,
                    {
                      key: "total",
                      type: "numberRange",
                      min: filters.totalMin,
                      max: filters.totalMax,
                      onMinChange: (value) => updateFilter("totalMin", value),
                      onMaxChange: (value) => updateFilter("totalMax", value),
                    },
                    {
                      key: "status",
                      type: "select",
                      value: filters.status,
                      options: [
                        { value: "ALL", label: "ALL" },
                        { value: "PENDING", label: "PENDING" },
                        { value: "CONFIRMED", label: "CONFIRMED" },
                        { value: "CANCELLED", label: "CANCELLED" },
                      ],
                      onChange: (value) => updateFilter("status", value),
                    },
                    {
                      key: "order_date",
                      type: "dateRange",
                      from: filters.dateFrom,
                      to: filters.dateTo,
                      onFromChange: (value) => updateFilter("dateFrom", value),
                      onToChange: (value) => updateFilter("dateTo", value),
                    },
                  ]}
                  actionCell={
                    <button className="btn-secondary !rounded-xl !px-3 !py-2 !text-xs" type="button" onClick={clearFilters}>
                      Clear All
                    </button>
                  }
                />
              ) : null}
            </thead>
            <TableState
              loading={loading}
              itemsLength={table.paginatedItems.length}
              colSpan={7}
              emptyMessage="No orders yet - create your first order."
            >
              {table.paginatedItems.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer border-t border-ink/5 bg-white/75 text-sm text-ink transition hover:bg-brand-50/70"
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <td className="px-4 py-4 font-semibold">{shortId(order.id)}</td>
                  <td className="px-4 py-4">{order.customer_name}</td>
                  <td className="px-4 py-4">{order.item_count}</td>
                  <td className="px-4 py-4">{formatCurrency(order.total_amount)}</td>
                  <td className="px-4 py-4">
                    <Badge tone={getStatusTone(order.status)}>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-4">{formatDateTime(order.order_date)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                      <button className="btn-ghost" type="button" onClick={() => navigate(`/orders/${order.id}`)}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="btn-ghost text-berry-700 hover:bg-berry-50"
                        type="button"
                        disabled={order.status === "CANCELLED"}
                        onClick={() => setCancelTarget(order)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </TableState>
          </table>
        </div>
        <PaginationControls
          page={table.page}
          pageSize={table.pageSize}
          totalItems={table.totalItems}
          totalPages={table.totalPages}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
        />
      </div>

      <OrderWizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSubmit={handleCreateOrder}
        submitting={submitting}
        customers={customers}
        products={products.filter((product) => product.quantity > 0)}
      />

      <OrderDetailDrawer open={Boolean(selectedOrderId)} onClose={() => setSelectedOrderId(null)} orderId={selectedOrderId} />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelOrder}
        title="Cancel order"
        message={`Cancel order ${shortId(cancelTarget?.id)} and restore its stock quantities?`}
        confirmLabel="Cancel order"
        confirming={cancelling}
      />
    </div>
  );
}
