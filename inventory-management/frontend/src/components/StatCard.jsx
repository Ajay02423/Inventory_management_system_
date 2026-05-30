export default function StatCard({ icon: Icon, label, value, accentClass, compact = false }) {
  return (
    <div className={`panel surface-grid relative overflow-hidden ${compact ? "px-4 py-3" : "p-5"}`}>
      <div className={`absolute inset-x-0 top-0 h-1.5 ${accentClass}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/50">{label}</p>
          <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
        </div>
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-800">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
