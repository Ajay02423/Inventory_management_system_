export default function PaginationControls({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, page - 3),
    Math.max(5, page + 2)
  );

  return (
    <div className="flex flex-col gap-4 border-t border-ink/10 px-4 py-4 text-sm text-ink/70 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <span>Showing {start}-{end} of {totalItems} results</span>
        <label className="inline-flex items-center gap-2">
          <span>Rows per page</span>
          <select
            className="field-input !w-auto !rounded-xl !px-3 !py-2 !text-sm"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-secondary !rounded-xl !px-3 !py-2" type="button" onClick={() => onPageChange(1)} disabled={page === 1}>
          First
        </button>
        <button className="btn-secondary !rounded-xl !px-3 !py-2" type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          Prev
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${pageNumber === page ? "bg-ink text-white" : "border border-ink/10 bg-white text-ink"}`}
            type="button"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button className="btn-secondary !rounded-xl !px-3 !py-2" type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
          Next
        </button>
        <button className="btn-secondary !rounded-xl !px-3 !py-2" type="button" onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>
          Last
        </button>
      </div>
    </div>
  );
}
