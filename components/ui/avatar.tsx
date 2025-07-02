import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
)
Avatar.displayName = "Avatar"

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-gray-300 text-xs font-semibold uppercase",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
)
AvatarFallback.displayName = "AvatarFallback"