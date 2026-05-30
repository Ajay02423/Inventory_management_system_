import { ChartColumn, ClipboardList, Download, Package, TriangleAlert, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardOrdersChart from "../components/DashboardOrdersChart";
import FilterToggleButton from "../components/FilterToggleButton";
import PageHeader from "../components/PageHeader";
import PaginationControls from "../components/PaginationControls";
import SortableHeader from "../components/SortableHeader";
import StatCard from "../components/StatCard";
import TableFiltersRow from "../components/TableFiltersRow";
import TableState from "../components/TableState";
import useDataTable from "../hooks/useDataTable";
import { getDashboardSummary } from "../services/dashboard";
import { buildExportFilename, downloadCSV, formatCurrency } from "../utils";

const initialFilters = {
  name: "",
  sku: "",
  stockMin: "",
  stockMax: "",
  thresholdMin: "",
  thresholdMax: "",
};

function inNumberRange(value, min, max) {
  if (min !== "" && Number(value) < Number(min)) return false;
  if (max !== "" && Number(value) > Number(max)) return false;
  return true;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboardSummary();
        setDashboard(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const lowStockProducts = dashboard?.low_stock_products || [];

  const table = useDataTable({
    items: lowStockProducts,
    search: "",
    searchFields: ["name", "sku"],
    filterState: filters,
    filterFn: (product, currentFilters) =>
      product.name.toLowerCase().includes(currentFilters.name.toLowerCase()) &&
      product.sku.toLowerCase().includes(currentFilters.sku.toLowerCase()) &&
      inNumberRange(product.quantity, currentFilters.stockMin, currentFilters.stockMax) &&
      inNumberRange(product.low_stock_threshold, currentFilters.thresholdMin, currentFilters.thresholdMax),
    sortAccessors: {
      name: (product) => product.name,
      sku: (product) => product.sku,
      stock: (product) => Number(product.quantity),
      threshold: (product) => Number(product.low_stock_threshold),
      stock_gap: (product) => Number(product.low_stock_threshold - product.quantity),
    },
  });

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearAll = () => {
    setFilters(initialFilters);
  };

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== "" && value !== null && value !== undefined).length,
    [filters]
  );

  const exportRows = useMemo(
    () =>
      table.filteredItems.map((product) => ({
        "Product Name": product.name,
        SKU: product.sku,
        "Current Stock": product.quantity,
        Threshold: product.low_stock_threshold,
        "Stock Gap": product.low_stock_threshold - product.quantity,
      })),
    [table.filteredItems]
  );

  return (
    <div className="space-y-8">
      <PageHeader title="Operations Dashboard" />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <DashboardOrdersChart />

        <div className="flex flex-col gap-3">
          <StatCard icon={Package} label="Total Products" value={loading ? "..." : dashboard?.total_products ?? 0} accentClass="bg-brand-400" compact />
          <StatCard icon={Users} label="Total Customers" value={loading ? "..." : dashboard?.total_customers ?? 0} accentClass="bg-accent-400" compact />
          <StatCard icon={ClipboardList} label="Confirmed Orders" value={loading ? "..." : dashboard?.total_orders ?? 0} accentClass="bg-berry-400" compact />
          <StatCard icon={ChartColumn} label="Total Revenue" value={loading ? "..." : formatCurrency(dashboard?.total_revenue)} accentClass="bg-ink" compact />
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-ink/10 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-accent-100 p-3 text-accent-800">
              <TriangleAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl">Low Stock Alert</h2>
              <p className="mt-1 text-sm text-ink/65">Products appear here when current stock is below their own alert threshold.</p>
            </div>
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
              onClick={() => downloadCSV(exportRows, buildExportFilename("low_stock"))}
              disabled={!exportRows.length}
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink/10 text-left">
            <thead className="bg-white/70 text-sm text-ink/55">
              <tr>
                <th className="px-4 py-4"><SortableHeader label="Product Name" sortKey="name" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="SKU" sortKey="sku" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Current Stock" sortKey="stock" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Threshold" sortKey="threshold" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Stock Gap" sortKey="stock_gap" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4 text-right font-semibold">Actions</th>
              </tr>
              {showFilters ? (
                <TableFiltersRow
                  filters={[
                    { key: "name", type: "text", value: filters.name, onChange: (value) => updateFilter("name", value) },
                    { key: "sku", type: "text", value: filters.sku, onChange: (value) => updateFilter("sku", value) },
                    {
                      key: "stock",
                      type: "numberRange",
                      min: filters.stockMin,
                      max: filters.stockMax,
                      onMinChange: (value) => updateFilter("stockMin", value),
                      onMaxChange: (value) => updateFilter("stockMax", value),
                    },
                    {
                      key: "threshold",
                      type: "numberRange",
                      min: filters.thresholdMin,
                      max: filters.thresholdMax,
                      onMinChange: (value) => updateFilter("thresholdMin", value),
                      onMaxChange: (value) => updateFilter("thresholdMax", value),
                    },
                    null,
                  ]}
                  actionCell={
                    <button className="btn-secondary !rounded-xl !px-3 !py-2 !text-xs" type="button" onClick={clearAll}>
                      Clear All
                    </button>
                  }
                />
              ) : null}
            </thead>
            <TableState
              loading={loading}
              itemsLength={table.paginatedItems.length}
              colSpan={6}
              emptyMessage="No low stock products right now."
            >
              {table.paginatedItems.map((product) => (
                <tr key={product.id} className="border-t border-ink/5 bg-white/75 text-sm text-ink">
                  <td className="px-4 py-4 font-semibold">{product.name}</td>
                  <td className="px-4 py-4">{product.sku}</td>
                  <td className="px-4 py-4">{product.quantity}</td>
                  <td className="px-4 py-4">{product.low_stock_threshold}</td>
                  <td className="px-4 py-4">{product.low_stock_threshold - product.quantity}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end">
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => navigate("/products", { state: { editProductId: product.id } })}
                      >
                        Restock
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
      </section>
    </div>
  );
}
