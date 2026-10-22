import { useEffect, useId, useRef } from 'react'
import { CloseIcon, SearchIcon } from '../ui/icons'

interface Props {
  value: string
  onValueChange: (value: string) => void
}

/**
 * The page's primary instrument. `/` focuses it from anywhere; Escape empties it. The live result
 * count is announced by the page, so this stays a plain field.
 */
export function EventSearch({ value, onValueChange }: Props) {
  const inputId = useId()
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const active = document.activeElement
      const typing =
        active instanceof HTMLElement &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)
      if (typing) return
      event.preventDefault()
      input.current?.focus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        Search events by name or venue
      </label>
      <SearchIcon
        width={18}
        height={18}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-soft"
      />
      <input
        id={inputId}
        ref={input}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) {
            event.preventDefault()
            onValueChange('')
          }
        }}
        placeholder="Search events"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        aria-controls="event-list"
        className="h-12 w-full appearance-none rounded-full border bg-surface pr-14 pl-11 text-[15px] text-heading placeholder:text-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onValueChange('')
            input.current?.focus()
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-soft transition-colors hover:bg-surface-inset hover:text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading"
        >
          <CloseIcon width={16} height={16} />
        </button>
      ) : (
        <kbd
          aria-hidden="true"
          className="absolute top-1/2 right-4 hidden h-6 -translate-y-1/2 items-center rounded-md border bg-surface-inset px-2 font-body text-[11px] font-bold text-body sm:flex"
        >
          /
        </kbd>
      )}
    </div>
  )
}
