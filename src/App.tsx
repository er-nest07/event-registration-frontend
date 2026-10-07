import { Link, Route, Routes } from 'react-router-dom'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { Button } from './components/ui/Button'
import { EventDetailPage } from './pages/EventDetailPage'
import { EventListPage } from './pages/EventListPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResendPage } from './pages/ResendPage'
import { TicketPage } from './pages/TicketPage'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<EventListPage />} />
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
  )
}
