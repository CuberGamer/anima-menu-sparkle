type Props = {
  label: string;
  value: number;
  max: number;
  tone?: "alert" | "calm";
};

/** Barra de estado reutilizable (sospecha, tiempo, o cualquier recurso futuro). */
export function StatBar({ label, value, max, tone = "calm" }: Props) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between text-[7px] text-primary-foreground sm:text-[9px]">
        <span>{label}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="mt-0.5 h-2 w-full bg-[var(--panel-frame)] sm:h-2.5">
        <div
          className={
            "h-full transition-[width] duration-300 " +
            (tone === "alert" ? "bg-destructive" : "bg-primary")
          }
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
