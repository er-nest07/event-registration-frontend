import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-on-brand hover:bg-brand-strong shadow-[0_8px_20px_-8px_rgba(51,102,255,0.6)]',
  secondary: 'bg-transparent text-brand border border-brand/40 hover:bg-brand-soft',
  danger: 'bg-danger text-white hover:opacity-90',
  ghost: 'bg-surface-inset text-heading hover:bg-border',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  )
}
