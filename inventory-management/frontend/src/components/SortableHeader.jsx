const iconByState = {
  asc: "↑",
  desc: "↓",
  none: "↕",
};

export default function SortableHeader({ label, sortKey, activeSort, onToggle, align = "left" }) {
  const direction = activeSort.key === sortKey ? activeSort.direction : "none";
  const alignment = align === "right" ? "justify-end text-right" : "justify-start text-left";

  return (
    <button
      className={`inline-flex w-full items-center gap-2 ${alignment} font-semibold text-inherit`}
      type="button"
      onClick={() => onToggle(sortKey)}
    >
      <span>{label}</span>
      <span className="text-xs text-ink/45">{iconByState[direction]}</span>
    </button>
  );
}
