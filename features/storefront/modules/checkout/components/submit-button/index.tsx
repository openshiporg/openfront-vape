"use client"

import { buttonVariants } from "@/components/ui/button"
import React from "react"
import { useFormStatus } from "react-dom"
import { RiLoader2Fill } from "@remixicon/react"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { vpPrimaryButton, vpSecondaryButton } from "@/features/storefront/modules/common/components/vp-classes"

type ButtonVariant = "secondary" | "outline" | "destructive" | "link" | "default" | "ghost" | null;

export function SubmitButton({
  children,
  variant = "default",
  className,
  size,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: ButtonVariant
  className?: string
  size?: VariantProps<typeof buttonVariants>["size"]
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()
  const secondary = variant === "outline" || variant === "secondary" || variant === "ghost"

  return (
    <button
      className={cn(
        secondary ? cn(vpSecondaryButton, "h-12 px-5") : vpPrimaryButton,
        variant === "destructive" && "bg-vp-danger",
        variant === "link" && "h-auto min-h-11 bg-transparent px-0 text-vp-ink underline underline-offset-4 hover:opacity-100",
        className
      )}
      data-size={size || undefined}
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      data-testid={dataTestId}
    >
      {pending && <RiLoader2Fill className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
