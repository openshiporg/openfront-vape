'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { ErrorLine } from '@/features/platform/components/compliance-form'

export type TransitionAction = {
  key: string
  label: string
  done: string
  danger?: boolean
  run: () => Promise<{ success: true } | { success: false; error: string }>
}

export const actionClass =
  'inline-flex min-h-8 items-center rounded-full px-3 text-[13px] font-medium ring-1 ring-inset ring-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50 max-sm:min-h-10'

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
              className={cn(actionClass, action.danger && asking && 'bg-red-600 text-white ring-red-600 hover:bg-red-700 dark:bg-red-500')}
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
