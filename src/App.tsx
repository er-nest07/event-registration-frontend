import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { IntroProvider } from './components/intro/IntroProvider'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { Button } from './components/ui/Button'
import { EventDetailPage } from './pages/EventDetailPage'
import { EventListPage } from './pages/EventListPage'
import { HomePage } from './pages/HomePage'
import { RegisterPage } from './pages/RegisterPage'
import { ResendPage } from './pages/ResendPage'
import { TicketPage } from './pages/TicketPage'

export default function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <IntroProvider active={isHome}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-16 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-surface-raised focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-heading focus:shadow-card focus:outline-2 focus:outline-offset-2 focus:outline-heading"
        >
          Skip to main content
        </a>
        <main id="main-content" className="flex-1 pt-16" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventListPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/:id/register" element={<RegisterPage />} />
            <Route path="/tickets/:code" element={<TicketPage />} />
            <Route path="/resend" element={<ResendPage />} />
            <Route
              path="*"
              element={
                <div className="mx-auto max-w-xl px-4 py-20 text-center">
                  <h1 className="text-3xl">Page not found</h1>
                  <Link to="/events" className="mt-6 inline-block">
                    <Button variant="secondary">Back to events</Button>
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </IntroProvider>
  )
}
