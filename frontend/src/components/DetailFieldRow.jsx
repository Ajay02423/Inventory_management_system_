export default function DetailFieldRow({
  label,
  value,
  valueClassName = "break-words",
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="w-28 flex-shrink-0 pt-0.5 text-xs leading-relaxed text-ink/50">
        {label}
      </span>
      <span className={`min-w-0 flex-1 text-sm leading-relaxed text-ink ${valueClassName}`}>
        {value || <span className="italic text-ink/30">-</span>}
      </span>
    </div>
  );
}
