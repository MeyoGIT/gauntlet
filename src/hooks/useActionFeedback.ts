import { useState } from 'react'
import type { FeedbackType } from '../components/ActionFeedback'

const DISPLAY_MS = 1000

export function useActionFeedback() {
  const [feedback, setFeedback] = useState<{ type: FeedbackType; id: number } | null>(null)

  function triggerFeedback(type: FeedbackType) {
    const id = Date.now()
    setFeedback({ type, id })
    window.setTimeout(() => setFeedback(curr => (curr?.id === id ? null : curr)), DISPLAY_MS)
  }

  return { feedback, triggerFeedback }
}
