import { cn } from "@/lib/utils";
import { InvoiceStatus } from "@/lib/types";
import { INVOICE_STATUSES } from "@/lib/constants";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  size?: "sm" | "md";
}

export default function InvoiceStatusBadge({
  status,
  size = "md",
}: InvoiceStatusBadgeProps) {
  const config = INVOICE_STATUSES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        config.bgColor,
        config.color,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          status === "paid" && "bg-success",
          status === "sent" && "bg-info",
          status === "draft" && "bg-gray-400",
          status === "overdue" && "bg-danger",
          status === "cancelled" && "bg-gray-400"
        )}
      />
      {config.label}
    </span>
  );
}
