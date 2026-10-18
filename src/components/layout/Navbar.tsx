import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ThemeToggle } from '../ui/ThemeToggle'
import { CloseIcon, MenuIcon } from '../ui/icons'
import { useIntro } from '../intro/IntroProvider'
import css267Logo from '../../visuals/CSS267-logo.webp'

const links = [{ to: '/events', label: 'Events' }]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { introDone } = useIntro()

  return (
    <header
      inert={!introDone}
      className={`fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-surface/70 backdrop-blur-md transition-[opacity,transform] duration-700 ease-out ${
        introDone ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
      }`}
    >
      <nav className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading"
          onClick={() => setOpen(false)}
        >
          <img
            src={css267Logo}
            alt="CSS KNUST logo"
            className="h-12 w-auto object-contain"
          />
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
