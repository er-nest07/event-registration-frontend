import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CloseIcon, MenuIcon } from '../ui/icons'
import { useIntro } from '../intro/IntroProvider'

const links = [{ to: '/events', label: 'Events' }]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { introDone } = useIntro()

  return (
    <header
      inert={!introDone}
      className={`fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-white transition-[opacity,transform] duration-700 ease-out ${
        introDone ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
      }`}
    >
      <nav className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading"
          onClick={() => setOpen(false)}
        >
          <span className="flex flex-col font-display text-[14px] leading-[1.2] font-semibold tracking-[-0.01em] text-black uppercase sm:text-[16px]">
            <span>Computer Science</span>
            <span>
              Society<span aria-hidden="true">_</span>
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#e5e5e5] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2 md:hidden">
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
        <div className="border-t bg-white px-4 py-3 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="inline-block rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e5e5e5] hover:text-black"
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
