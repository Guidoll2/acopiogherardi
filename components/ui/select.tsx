import * as React from "react"
import * as RadixSelect from "@radix-ui/react-select"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export const Select = RadixSelect.Root
export const SelectGroup = RadixSelect.Group

export const SelectValue = RadixSelect.Value

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <RadixSelect.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </RadixSelect.Icon>
  </RadixSelect.Trigger>
))
SelectTrigger.displayName = "SelectTrigger"

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Content>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-lg animate-in fade-in-80",
        className
      )}
      {...props}
    >
      <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
    </RadixSelect.Content>
  </RadixSelect.Portal>
))
SelectContent.displayName = "SelectContent"

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Item>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none focus:bg-green-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
  </RadixSelect.Item>
))
SelectItem.displayName = "SelectItem"