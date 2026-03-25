type StatusCardProps = {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
};

const toneClasses: Record<NonNullable<StatusCardProps["tone"]>, string> = {
  default: "border-stone-200 bg-white text-stone-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
};

export function StatusCard({
  label,
  value,
  tone = "default",
}: StatusCardProps) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-sm font-medium uppercase tracking-[0.18em] opacity-70">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold">{value}</p>
    </div>
  );
}
