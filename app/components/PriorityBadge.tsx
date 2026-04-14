interface PriorityBadgeProps {
  priority: "critical" | "high" | "medium" | "low";
  size?: "sm" | "md";
}

const badgeStyles: Record<string, string> = {
  critical: "bg-red-700 text-white",
  high: "bg-red-700 text-white",
  medium: "bg-amber-700 text-white",
  low: "bg-green-700 text-white",
};

export default function PriorityBadge({ priority, size = "sm" }: PriorityBadgeProps) {
  const baseClass =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] font-bold rounded"
      : "px-3 py-1 text-xs font-bold rounded-md tracking-wide uppercase";

  return (
    <span className={`inline-flex items-center ${baseClass} ${badgeStyles[priority]}`}>
      {priority === "critical" ? "Critical" : priority === "high" ? "High" : priority === "medium" ? "Medium" : "Low"}
    </span>
  );
}
