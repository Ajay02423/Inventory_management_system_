import { useEffect, useMemo, useState } from "react";

function defaultSearchMatcher(item, search, searchFields) {
  if (!search) {
    return true;
  }

  return searchFields.some((field) => {
    const value = typeof field === "function" ? field(item) : item[field];
    return String(value ?? "").toLowerCase().includes(search);
  });
}

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  const dateA = new Date(a);
  const dateB = new Date(b);
  if (!Number.isNaN(dateA.getTime()) && !Number.isNaN(dateB.getTime()) && (String(a).includes("-") || a instanceof Date)) {
    return dateA.getTime() - dateB.getTime();
  }

  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

export default function useDataTable({
  items,
  search,
  searchFields,
  filterState,
  filterFn,
  sortAccessors,
  initialPageSize = 10,
}) {
  const [sortState, setSortState] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setSortState({ key: null, direction: "asc" });
    setPage(1);
  }, [search, JSON.stringify(filterState)]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = defaultSearchMatcher(item, normalizedSearch, searchFields);
      if (!matchesSearch) {
        return false;
      }
      return filterFn ? filterFn(item, filterState) : true;
    });
  }, [items, normalizedSearch, searchFields, filterFn, filterState]);

  const sortedItems = useMemo(() => {
    if (!sortState.key) {
      return filteredItems;
    }

    const accessor = sortAccessors[sortState.key];
    if (!accessor) {
      return filteredItems;
    }

    return [...filteredItems].sort((left, right) => {
      const leftValue = typeof accessor === "function" ? accessor(left) : left[accessor];
      const rightValue = typeof accessor === "function" ? accessor(right) : right[accessor];
      const comparison = compareValues(leftValue, rightValue);
      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredItems, sortAccessors, sortState]);

  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [pageSize, safePage, sortedItems]);

  const toggleSort = (key) => {
    setSortState((current) => {
      if (current.key !== key) {
        return { key, direction: "asc" };
      }

      return {
        key,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  return {
    sortState,
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    filteredItems: sortedItems,
    paginatedItems,
    setPage,
    setPageSize,
    toggleSort,
  };
}
