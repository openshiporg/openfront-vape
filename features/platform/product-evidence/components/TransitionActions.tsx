'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { ErrorLine } from '@/features/platform/components/compliance-form'
import { buttonClass } from '@/features/platform/components/vape-ui'

export type TransitionAction = {
  key: string
  label: string
  done: string
  danger?: boolean
  /** The record's next step; renders as the one ink button. */
  primary?: boolean
  run: () => Promise<{ success: true } | { success: false; error: string }>
}

export const actionClass = cn(buttonClass.base, buttonClass.outline)

/** Explicit state transitions for a record; a danger action asks once more before it runs. */
export function TransitionActions({ actions, className, children }: {
  actions: TransitionAction[]
  className?: string
  children?: React.ReactNode
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  if (!actions.length && !children) return null

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {actions.map(action => {
          const asking = confirming === action.key
          return (
            <button
              key={action.key}
              type="button"
              disabled={pending}
              className={cn(
                buttonClass.base,
                action.danger && asking ? buttonClass.danger : action.primary ? buttonClass.primary : buttonClass.outline,
              )}
              onClick={() => {
                if (action.danger && !asking) { setConfirming(action.key); return }
                setConfirming(null)
                setError('')
                startTransition(async () => {
                  const result = await action.run()
                  if (!result.success) { setError(result.error); return }
                  toast.success(action.done)
                  router.refresh()
                })
              }}
              onBlur={() => { if (asking) setConfirming(null) }}
            >
              {asking ? `Confirm ${action.label.toLowerCase()}` : action.label}
            </button>
          )
        })}
      </div>
      <ErrorLine message={error} />
    </div>
  )
}
