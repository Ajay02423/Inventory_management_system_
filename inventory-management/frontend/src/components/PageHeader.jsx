export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Operations Control</p>
        <h1 className="mt-2 text-4xl md:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-base text-ink/70">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
