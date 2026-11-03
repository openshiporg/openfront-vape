"use client"

import { useEffect } from "react"

// Sheets and popovers portal onto <body>; mirror the Deneb classes there so they share the type.
export function DenebBodyClass({ className }: { className: string }) {
  useEffect(() => {
    const classes = className.split(" ").filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [className])
  return null
}
