import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Badge from "../components/Badge";
import ConfirmDialog from "../components/ConfirmDialog";
import FilterToggleButton from "../components/FilterToggleButton";
import PageHeader from "../components/PageHeader";
import PaginationControls from "../components/PaginationControls";
import ProductDetailDrawer from "../components/ProductDetailDrawer";
import ProductFormModal from "../components/ProductFormModal";
import SearchInput from "../components/SearchInput";
import SortableHeader from "../components/SortableHeader";
import TableFiltersRow from "../components/TableFiltersRow";
import TableState from "../components/TableState";
import useDataTable from "../hooks/useDataTable";
import { createProduct, deleteProduct, listProducts, updateProduct } from "../services/products";
import {
  buildExportFilename,
  downloadCSV,
  formatCurrency,
  formatDateTime,
} from "../utils";

const initialFilters = {
  name: "",
  sku: "",
  priceMin: "",
  priceMax: "",
  stockMin: "",
  stockMax: "",
  thresholdMin: "",
  thresholdMax: "",
  createdFrom: "",
  createdTo: "",
};

function inNumberRange(value, min, max) {
  if (min !== "" && Number(value) < Number(min)) return false;
  if (max !== "" && Number(value) > Number(max)) return false;
  return true;
}

function inDateRange(value, from, to) {
  if (!from && !to) return true;
  const date = new Date(value);
  if (from) {
    const start = new Date(from);
    if (date < start) return false;
  }
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (date > end) return false;
  }
  return true;
}

export default function ProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await listProducts();
      setProducts(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!location.state?.editProductId || !products.length) {
      return;
    }

    const match = products.find((product) => product.id === location.state.editProductId);
    if (match) {
      setEditingProduct(match);
      setModalOpen(true);
    }

    navigate("/products", { replace: true, state: null });
  }, [location.state, navigate, products]);

  const table = useDataTable({
    items: products,
    search: deferredSearch,
    searchFields: ["name", "sku"],
    filterState: filters,
    filterFn: (product, currentFilters) =>
      product.name.toLowerCase().includes(currentFilters.name.toLowerCase()) &&
      product.sku.toLowerCase().includes(currentFilters.sku.toLowerCase()) &&
      inNumberRange(product.price, currentFilters.priceMin, currentFilters.priceMax) &&
      inNumberRange(product.quantity, currentFilters.stockMin, currentFilters.stockMax) &&
      inNumberRange(product.low_stock_threshold, currentFilters.thresholdMin, currentFilters.thresholdMax) &&
      inDateRange(product.created_at, currentFilters.createdFrom, currentFilters.createdTo),
    sortAccessors: {
      name: (product) => product.name,
      sku: (product) => product.sku,
      price: (product) => Number(product.price),
      stock: (product) => Number(product.quantity),
      threshold: (product) => Number(product.low_stock_threshold),
      created_at: (product) => product.created_at,
    },
  });

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success("Product updated successfully.");
      } else {
        await createProduct(payload);
        toast.success("Product created successfully.");
      }
      setModalOpen(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      await deleteProduct(deleteTarget.id);
      toast.success("Product deleted successfully.");
      setDeleteTarget(null);
      if (selectedProduct?.id === deleteTarget.id) {
        setSelectedProduct(null);
      }
      await fetchProducts();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
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
    () => Object.values(filters).filter((value) => value !== "" && value !== null && value !== undefined).length,
    [filters]
  );

  const exportRows = useMemo(
    () =>
      table.filteredItems.map((product) => ({
        Name: product.name,
        SKU: product.sku,
        "Price (INR)": product.price,
        Stock: product.quantity,
        Threshold: product.low_stock_threshold,
        Description: product.description || "",
        "Created At": formatDateTime(product.created_at),
      })),
    [table.filteredItems]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        action={
          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        }
      />

      <div className="panel p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product name or SKU" />
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
              onClick={() => downloadCSV(exportRows, buildExportFilename("products"))}
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
                <th className="px-4 py-4"><SortableHeader label="Name" sortKey="name" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="SKU" sortKey="sku" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Price" sortKey="price" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Stock" sortKey="stock" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Threshold" sortKey="threshold" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Created At" sortKey="created_at" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4 text-right font-semibold">Actions</th>
              </tr>
              {showFilters ? (
                <TableFiltersRow
                  filters={[
                    { key: "name", type: "text", value: filters.name, onChange: (value) => updateFilter("name", value) },
                    { key: "sku", type: "text", value: filters.sku, onChange: (value) => updateFilter("sku", value) },
                    {
                      key: "price",
                      type: "numberRange",
                      min: filters.priceMin,
                      max: filters.priceMax,
                      onMinChange: (value) => updateFilter("priceMin", value),
                      onMaxChange: (value) => updateFilter("priceMax", value),
                    },
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
                    {
                      key: "created_at",
                      type: "dateRange",
                      from: filters.createdFrom,
                      to: filters.createdTo,
                      onFromChange: (value) => updateFilter("createdFrom", value),
                      onToChange: (value) => updateFilter("createdTo", value),
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
              emptyMessage="No products yet - add your first product."
            >
              {table.paginatedItems.map((product) => (
                <tr
                  key={product.id}
                  className="cursor-pointer border-t border-ink/5 bg-white/75 text-sm text-ink transition hover:bg-brand-50/70"
                  onClick={() => setSelectedProduct(product)}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image_url || "https://placehold.co/300x200/111827/9ca3af?text=No+Image"}
                        alt={product.name}
                        className="h-12 w-16 rounded-lg object-cover"
                        onError={(event) => {
                          event.currentTarget.src = "https://placehold.co/300x200/111827/9ca3af?text=No+Image";
                        }}
                      />
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        {product.description ? <p className="mt-1 text-xs text-ink/55">{product.description}</p> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">{product.sku}</td>
                  <td className="px-4 py-4">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-4">
                    <Badge tone={product.quantity < product.low_stock_threshold ? "danger" : "success"}>{product.quantity} in stock</Badge>
                  </td>
                  <td className="px-4 py-4">{product.low_stock_threshold}</td>
                  <td className="px-4 py-4">{formatDateTime(product.created_at)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        className="btn-ghost"
                        type="button"
                        onClick={() => {
                          setEditingProduct(product);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="btn-ghost text-berry-700 hover:bg-berry-50" type="button" onClick={() => setDeleteTarget(product)}>
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

      <ProductFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSave}
        submitting={saving}
        product={editingProduct}
      />

      <ProductDetailDrawer
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onEdit={(product) => {
          setSelectedProduct(null);
          setEditingProduct(product);
          setModalOpen(true);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete product"
        message={`Delete ${deleteTarget?.name || "this product"} from your catalog?`}
        confirmLabel="Delete product"
        confirming={deleting}
      />
    </div>
  );
}
