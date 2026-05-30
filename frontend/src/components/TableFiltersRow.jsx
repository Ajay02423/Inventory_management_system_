function RenderFilter({ filter }) {
  if (!filter) {
    return null;
  }

  if (filter.type === "text") {
    return (
      <input
        className="field-input !rounded-xl !px-3 !py-2 !text-xs"
        placeholder={filter.placeholder || "Filter..."}
        value={filter.value}
        onChange={(event) => filter.onChange(event.target.value)}
      />
    );
  }

  if (filter.type === "numberRange") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <input
          className="field-input !rounded-xl !px-3 !py-2 !text-xs"
          placeholder="Min"
          value={filter.min}
          onChange={(event) => filter.onMinChange(event.target.value)}
        />
        <input
          className="field-input !rounded-xl !px-3 !py-2 !text-xs"
          placeholder="Max"
          value={filter.max}
          onChange={(event) => filter.onMaxChange(event.target.value)}
        />
      </div>
    );
  }

  if (filter.type === "dateRange") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <input
          className="field-input !rounded-xl !px-3 !py-2 !text-xs"
          type="date"
          value={filter.from}
          onChange={(event) => filter.onFromChange(event.target.value)}
        />
        <input
          className="field-input !rounded-xl !px-3 !py-2 !text-xs"
          type="date"
          value={filter.to}
          onChange={(event) => filter.onToChange(event.target.value)}
        />
      </div>
    );
  }

  if (filter.type === "select") {
    return (
      <select
        className="field-input !rounded-xl !px-3 !py-2 !text-xs"
        value={filter.value}
        onChange={(event) => filter.onChange(event.target.value)}
      >
        {filter.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return null;
}

export default function TableFiltersRow({ filters, actionCell }) {
  return (
    <tr className="border-t border-ink/10 bg-brand-50/60 align-top">
      {filters.map((filter, index) => (
        <th key={filter?.key || index} className="px-4 py-3 font-normal">
          <RenderFilter filter={filter} />
        </th>
      ))}
      {actionCell ? <th className="px-4 py-3 text-right">{actionCell}</th> : null}
    </tr>
  );
}
