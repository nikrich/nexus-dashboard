"use client"

import { TaskStatus } from "@/types"
import { getStatusColor, getStatusLabel } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: TaskStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClasses = getStatusColor(status)
  const label = getStatusLabel(status)

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClasses,
        className
      )}
    >
      {label}
    </span>
  )
}
