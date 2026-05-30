import { Filter } from "lucide-react";

export default function FilterToggleButton({ showFilters, activeFilterCount, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition-all ${
        showFilters || activeFilterCount > 0
          ? "border-brand-500 bg-brand-600 text-white"
          : "border-ink/10 bg-white text-ink/70 hover:bg-brand-50"
      }`}
    >
      <Filter className="h-4 w-4" />
      Filters
      {activeFilterCount > 0 ? (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-700">
          {activeFilterCount}
        </span>
      ) : null}
    </button>
  );
}
