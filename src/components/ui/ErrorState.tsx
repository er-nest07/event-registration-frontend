import { Button } from './Button'
import { AlertIcon, RefreshIcon } from './icons'

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-danger/30 bg-danger-soft px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger text-white">
        <AlertIcon />
      </span>
      <p className="max-w-md text-sm font-semibold text-danger">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <RefreshIcon width={16} height={16} />
          Try again
        </Button>
      )}
    </div>
  )
}
