import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
}

const variantClasses = {
  default: "bg-green-600 text-white hover:bg-green-700",
  outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-100",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
}

const sizeClasses = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 px-3 py-1 text-xs",
  lg: "h-12 px-6 py-3 text-base",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = "Button"