import * as React from "react"
import { cn } from "@/lib/utils"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 text-sm",
        variant === "destructive"
          ? "border-red-300 bg-red-50 text-red-900"
          : "border-gray-200 bg-white text-gray-900",
        className
      )}
      {...props}
    />
  )
)
Alert.displayName = "Alert"

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("mt-1 text-sm", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"