import { Card } from '../ui/Card'

const STEPS = [
  {
    num: 1,
    title: 'Find an event',
    body: 'Browse the Events page and pick one that interests you.',
  },
  {
    num: 2,
    title: 'Register for free',
    body: 'Just enter your name and email. No account, no payment needed.',
  },
  {
    num: 3,
    title: 'Show your QR at the door',
    body: 'You’ll get your ticket on screen and by email. Present the QR at check-in.',
  },
]

export function HowItWorks() {
  return (
    <section className="mt-14">
      <h2 className="text-center font-display text-3xl font-black text-heading sm:text-4xl">
        How it works
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-body">
        It’s quick, free, and you don’t need an account to register for an event.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step) => (
          <Card key={step.num} className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-on-brand">
                {step.num}
              </div>
              <div>
                <h3 className="font-heading text-lg font-black text-heading">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-body">{step.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
