import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ThemeToggle } from '../ui/ThemeToggle'
import { CloseIcon, MenuIcon } from '../ui/icons'

const links = [{ to: '/events', label: 'Events' }]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-40 bg-transparent">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-heading text-lg font-black text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-black text-on-brand">
            CSS
          </span>
          <span>
            Events <span className="text-brand">· KNUST</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-bold transition-colors hover:text-brand ${
                  isActive ? 'text-brand' : 'text-heading'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-heading"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t bg-surface px-4 py-3 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2.5 text-sm font-bold ${
                  isActive ? 'bg-brand-soft text-brand' : 'text-heading'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
