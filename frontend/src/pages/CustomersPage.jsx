import { Download, Plus, Trash2 } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import ConfirmDialog from "../components/ConfirmDialog";
import CustomerDetailDrawer from "../components/CustomerDetailDrawer";
import CustomerFormModal from "../components/CustomerFormModal";
import FilterToggleButton from "../components/FilterToggleButton";
import PageHeader from "../components/PageHeader";
import PaginationControls from "../components/PaginationControls";
import SearchInput from "../components/SearchInput";
import SortableHeader from "../components/SortableHeader";
import TableFiltersRow from "../components/TableFiltersRow";
import TableState from "../components/TableState";
import useDataTable from "../hooks/useDataTable";
import { createCustomer, deleteCustomer, listCustomers } from "../services/customers";
import { buildExportFilename, downloadCSV, formatDate, formatDateTime } from "../utils";

const initialFilters = {
  full_name: "",
  email: "",
  phone: "",
  joinedFrom: "",
  joinedTo: "",
};

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await listCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const table = useDataTable({
    items: customers,
    search: deferredSearch,
    searchFields: ["full_name", "email"],
    filterState: filters,
    filterFn: (customer, currentFilters) =>
      customer.full_name.toLowerCase().includes(currentFilters.full_name.toLowerCase()) &&
      customer.email.toLowerCase().includes(currentFilters.email.toLowerCase()) &&
      customer.phone.toLowerCase().includes(currentFilters.phone.toLowerCase()) &&
      inDateRange(customer.created_at, currentFilters.joinedFrom, currentFilters.joinedTo),
    sortAccessors: {
      full_name: (customer) => customer.full_name,
      email: (customer) => customer.email,
      phone: (customer) => customer.phone,
      created_at: (customer) => customer.created_at,
    },
  });

  const handleCreate = async (payload) => {
    try {
      setSaving(true);
      await createCustomer(payload);
      toast.success("Customer created successfully.");
      setModalOpen(false);
      await fetchCustomers();
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
      await deleteCustomer(deleteTarget.id);
      toast.success("Customer deleted successfully.");
      setDeleteTarget(null);
      if (selectedCustomer?.id === deleteTarget.id) {
        setSelectedCustomer(null);
      }
      await fetchCustomers();
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
      table.filteredItems.map((customer) => ({
        "Full Name": customer.full_name,
        Email: customer.email,
        Phone: customer.phone,
        "Joined Date": formatDateTime(customer.created_at),
      })),
    [table.filteredItems]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        action={
          <button className="btn-primary" type="button" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        }
      />

      <div className="panel p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by customer name or email" />
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
              onClick={() => downloadCSV(exportRows, buildExportFilename("customers"))}
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
                <th className="px-4 py-4"><SortableHeader label="Full Name" sortKey="full_name" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Email" sortKey="email" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Phone" sortKey="phone" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4"><SortableHeader label="Joined Date" sortKey="created_at" activeSort={table.sortState} onToggle={table.toggleSort} /></th>
                <th className="px-4 py-4 text-right font-semibold">Actions</th>
              </tr>
              {showFilters ? (
                <TableFiltersRow
                  filters={[
                    { key: "full_name", type: "text", value: filters.full_name, onChange: (value) => updateFilter("full_name", value) },
                    { key: "email", type: "text", value: filters.email, onChange: (value) => updateFilter("email", value) },
                    { key: "phone", type: "text", value: filters.phone, onChange: (value) => updateFilter("phone", value) },
                    {
                      key: "created_at",
                      type: "dateRange",
                      from: filters.joinedFrom,
                      to: filters.joinedTo,
                      onFromChange: (value) => updateFilter("joinedFrom", value),
                      onToChange: (value) => updateFilter("joinedTo", value),
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
              colSpan={5}
              emptyMessage="No customers yet - add your first customer."
            >
              {table.paginatedItems.map((customer) => (
                <tr
                  key={customer.id}
                  className="cursor-pointer border-t border-ink/5 bg-white/75 text-sm text-ink transition hover:bg-brand-50/70"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <td className="px-4 py-4 font-semibold">{customer.full_name}</td>
                  <td className="px-4 py-4">{customer.email}</td>
                  <td className="px-4 py-4">{customer.phone}</td>
                  <td className="px-4 py-4">{formatDate(customer.created_at)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
                      <button className="btn-ghost text-berry-700 hover:bg-berry-50" type="button" onClick={() => setDeleteTarget(customer)}>
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

      <CustomerFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} submitting={saving} />

      <CustomerDetailDrawer open={Boolean(selectedCustomer)} onClose={() => setSelectedCustomer(null)} customer={selectedCustomer} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete customer"
        message={`Delete ${deleteTarget?.full_name || "this customer"} and their orders? Active order stock will be restored.`}
        confirmLabel="Delete customer"
        confirming={deleting}
      />
    </div>
  );
}
