import Link from "next/link";
import PriorityBadge from "./PriorityBadge";

export interface EmailItem {
  id: string;
  from: string;
  fromInitials?: string;
  subject: string;
  time: string;
  priority: "critical" | "high" | "medium" | "low";
  category?: string;
  preview?: string;
}

interface EmailListItemProps {
  email: EmailItem;
}

export default function EmailListItem({ email }: EmailListItemProps) {
  return (
    <Link
      href={`/email/${email.id}`}
      className="flex items-center gap-4 px-4 py-3.5 rounded-lg border border-(--border-subtle) bg-(--bg-surface) hover:bg-(--bg-surface-raised) hover:border-(--border-accent)sition-all group"
    >
      {/* Priority Badge */}
      <PriorityBadge priority={email.priority} />

      {/* Sender Name */}
      <span className="font-semibold text-sm text-(--text-primary) min-w-[80px]">
        {email.from}
      </span>

      {/* Subject */}
      <span className="text-sm text-(--text-secondary) flex-1 truncate group-hover:text-(--text-primary) transition-colors">
        {email.subject}
      </span>

      {/* Time */}
      <span className="text-xs text-(--text-muted) whitespace-nowrap">
        {email.time}
      </span>
    </Link>
  );
}
