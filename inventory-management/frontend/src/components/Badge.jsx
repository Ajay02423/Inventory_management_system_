const toneClasses = {
  success: "bg-brand-100 text-brand-900",
  warning: "bg-accent-100 text-accent-900",
  danger: "bg-berry-100 text-berry-900",
  neutral: "bg-ink/10 text-ink",
};

export default function Badge({ children, tone = "neutral" }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone] || toneClasses.neutral}`}>
      {children}
    </span>
  );
}
