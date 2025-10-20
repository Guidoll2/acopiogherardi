"use client"

import React from "react"
import { cn } from "@/lib/utils"

type Animation = "fade-up" | "fade" | "pop"

interface AnimatedProps {
  children: React.ReactNode
  animation?: Animation
  className?: string
  stagger?: boolean
}

export function Animated({ children, animation = "fade-up", className, stagger = false }: AnimatedProps) {
  const animClass = animation === "fade-up" ? "anim-fade-up" : animation === "fade" ? "anim-fade" : "anim-pop"
  const staggerClass = stagger ? "anim-stagger" : ""

  return (
    <div className={cn("anim", animClass, staggerClass, className)}>
      {children}
    </div>
  )
}

export default Animated
