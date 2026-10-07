import { Link } from 'react-router-dom'

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-surface-raised">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-black text-heading">CSS Events</p>
          <p className="mt-2 text-sm leading-relaxed text-body">
            Event registration for the KNUST Computer Science Society. Get your ticket on screen and
            by email.
          </p>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-wide text-heading">Pages</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/events" className="text-body transition-colors hover:text-brand">
                Events
              </Link>
            </li>
            <li>
              <Link to="/resend" className="text-body transition-colors hover:text-brand">
                Resend my ticket
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-wide text-heading">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-body">
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
      <div className="border-t py-4 text-center text-xs text-soft">
        © {year} Computer Science Society, KNUST.
      </div>
    </footer>
  )
}
