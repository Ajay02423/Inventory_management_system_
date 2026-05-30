export default function EtharaBadge({ compact = false }) {
  const baseClassName = compact
    ? "flex items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 text-xs text-ink/70"
    : "flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/70";

  return (
    <a
      className={baseClassName}
      href="https://growth.ethara.ai"
      rel="noreferrer"
      target="_blank"
    >
      <img
        src="https://growth.ethara.ai/web/image/res.company/1/logo"
        alt="Ethara AI"
        className={`${compact ? "h-4" : "h-4"} w-auto object-contain ${compact ? "" : "opacity-80"}`}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      <span>
        Assessment by <strong className={compact ? "text-ink/90" : "text-white/90"}>Ethara AI</strong>
      </span>
    </a>
  );
}
