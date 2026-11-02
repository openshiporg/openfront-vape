'use client'
import { ViewerTime } from '@/features/dashboard/components/ViewerTime';

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Admin form controls that open as popovers instead of the browser's native
// select and date widgets, so they look the same on phones and desktops.

// Radix Select reserves the empty string, so "no choice" travels under this key.
const NONE = '__none__'

export type PickOption = readonly [value: string, label: string]

export function PickSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
  className,
  'aria-label': ariaLabel,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  options: readonly PickOption[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  'aria-label'?: string
}) {
  return (
    <Select
      value={value === '' ? NONE : value}
      onValueChange={next => onChange(next === NONE ? '' : next)}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className={cn('h-10 min-w-0 gap-2 rounded-[4px] px-3 text-left text-sm text-foreground [&>span]:min-w-0 [&>span]:truncate', className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-w-[calc(100vw-2rem)]">
        {options.map(([optionValue, label]) => (
          <SelectItem key={optionValue || NONE} value={optionValue === '' ? NONE : optionValue} className="min-h-10 whitespace-normal break-words">
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** "YYYY-MM-DD" in local time, the same value a native date input carries. */
function toDay(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function fromDay(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '')
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : undefined
}

export function DateField({
  id,
  value,
  onChange,
  required,
  disabled,
  placeholder = 'Pick a date',
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = fromDay(value)
  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            className="flex h-10 w-full min-w-0 items-center gap-2 rounded-[4px] border border-input bg-background px-3 text-left text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60"
          >
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className={cn('min-w-0 truncate tabular-nums', !selected && 'text-muted-foreground')}>
              {selected ? <ViewerTime value={selected} style="date" /> : placeholder}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] p-2">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={date => {
              onChange(date ? toDay(date) : '')
              setOpen(false)
            }}
          />
          {value && !required && (
            <button type="button" className="mt-1 h-10 w-full rounded-[4px] text-sm text-muted-foreground hover:bg-muted" onClick={() => { onChange(''); setOpen(false) }}>
              Clear date
            </button>
          )}
        </PopoverContent>
      </Popover>
      {/* Keeps the browser's required check on the form; the button above is what people use. */}
      {required && (
        <input
          aria-hidden="true"
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
        />
      )}
    </div>
  )
}
