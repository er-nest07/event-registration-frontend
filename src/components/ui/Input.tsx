import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  hint?: string
  error?: string
  onValueChange: (value: string) => void
}

export function Input({ label, hint, error, onValueChange, id, className = '', ...rest }: Props) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-bold text-heading">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(e) => onValueChange(e.target.value)}
        className={`h-12 w-full rounded-2xl border bg-surface px-4 text-base text-heading placeholder:text-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          error ? 'border-danger' : 'border-border'
        } ${className}`}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm font-semibold text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-sm text-soft">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
