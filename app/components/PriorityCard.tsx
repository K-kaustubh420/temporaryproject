interface PriorityCardProps {
  count: number;
  label: string;
  priority: "high" | "medium" | "low" | "critical";
}

const priorityColors: Record<string, { badge: string; border: string }> = {
  critical: {
    badge: "bg-red-700 text-white",
    border: "border-red-900/30",
  },
  high: {
    badge: "bg-red-700 text-white",
    border: "border-red-900/30",
  },
  medium: {
    badge: "bg-green-700 text-white",
    border: "border-green-900/30",
  },
  low: {
    badge: "bg-green-700 text-white",
    border: "border-green-900/30",
  },
};

export default function PriorityCard({ count, label, priority }: PriorityCardProps) {
  const colors = priorityColors[priority];

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border bg-(--bg-surface) px-5 py-4 transition-all hover:bg-(--bg-surface-raised) hover:border-(--border-accent) ${colors.border}`}
      style={{ minWidth: 160 }}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold ${colors.badge}`}
      >
        {count}
      </span>
      <span className="text-base font-medium text-(--text-primary)">
        {label}
      </span>
    </div>
  );
}
