export function uiMessage(code: string): string {
  switch (code) {
    case 'VALIDATION_ERROR':
    case 'INVALID_JSON':
    case 'PAYLOAD_TOO_LARGE':
      return 'Something went wrong. Please try again.'
    case 'UNAUTHORIZED':
      return 'Wrong or missing access key.'
    case 'NOT_FOUND':
    case 'TICKET_NOT_FOUND':
      return 'Not found.'
    case 'ALREADY_REGISTERED':
      return 'This email is already registered for this event.'
    case 'EVENT_FULL':
      return 'Sorry, this event is full.'
    case 'EVENT_ENDED':
      return 'This event has already ended.'
    case 'ALREADY_CHECKED_IN':
      return 'This ticket has already been used.'
    case 'RATE_LIMITED':
      return 'Too many requests. Please wait a moment and try again.'
    case 'INTERNAL_ERROR':
    case 'NETWORK_ERROR':
    case 'UNEXPECTED_RESPONSE':
      return 'Something went wrong. Please try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
