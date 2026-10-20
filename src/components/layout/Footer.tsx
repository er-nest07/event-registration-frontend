import { Link } from 'react-router-dom'

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="mt-16 bg-black">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <p
          aria-hidden="true"
          className="font-display text-[clamp(3.5rem,14vw,9rem)] leading-[0.9] font-black tracking-[-0.02em] text-white/20 select-none"
        >
          see you at the door
        </p>
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-black text-white">CSS Events</p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Event registration for the KNUST Computer Science Society. Get your ticket on screen and
            by email.
          </p>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-wide text-white">Pages</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/events" className="text-white/70 transition-colors hover:text-white">
                Events
              </Link>
            </li>
            <li>
              <Link to="/resend" className="text-white/70 transition-colors hover:text-white">
                Resend my ticket
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-wide text-white">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>KNUST, Kumasi, Ghana</li>
            <li>
              <a
                href="https://wa.me/233000000000"
                className="transition-colors hover:text-green"
                rel="noreferrer"
              >
                WhatsApp
              </a>{' '}
              ·{' '}
              <a href="https://t.me/" className="transition-colors hover:text-cyan" rel="noreferrer">
                Telegram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {year} Computer Science Society, KNUST.
      </div>
    </footer>
  )
}
