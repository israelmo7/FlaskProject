import { useCallback, useEffect, useState } from 'react'

/**
 * Room id comes from Flask: <div id="root" data-room-id="1">
 * In Vite dev without Flask, falls back to ?room=1 or "1".
 */
function readRoomId() {
  const fromDom = document.getElementById('root')?.dataset?.roomId
  if (fromDom) return fromDom
  const q = new URLSearchParams(window.location.search).get('room')
  return q || '1'
}

async function fetchMessages(roomId) {
  const res = await fetch(`/room/${roomId}/api/messages`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`load failed (${res.status})`)
  }
  const data = await res.json()
  return data.messages || []
}

async function postMessage(roomId, message) {
  const res = await fetch(`/room/${roomId}/api/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    throw new Error(`send failed (${res.status})`)
  }
  const data = await res.json()
  return data.messages || []
}

export default function App() {
  const roomId = readRoomId()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    try {
      const lines = await fetchMessages(roomId)
      setMessages(lines)
      setError('')
    } catch (err) {
      setError(err.message || 'Could not load messages')
    }
  }, [roomId])

  // First load + poll every 2 seconds
  useEffect(() => {
    load()
    const id = setInterval(load, 2000)
    return () => clearInterval(id)
  }, [load])

  async function onSend(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    setSending(true)
    setDraft('')
    // Optimistic: show your line immediately
    setMessages((prev) => [...prev, text])
    try {
      const lines = await postMessage(roomId, text)
      setMessages(lines)
      setError('')
    } catch (err) {
      setError(err.message || 'Send failed')
      await load()
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="chat">
      <header>
        <h1>Room chat</h1>
        <p className="meta">room {roomId}</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <ul className="log" aria-live="polite">
        {messages.length === 0 ? (
          <li className="empty">No messages yet. Say hello.</li>
        ) : (
          messages.map((line, i) => (
            <li key={`${i}-${line.slice(0, 24)}`}>{line}</li>
          ))
        )}
      </ul>

      <form onSubmit={onSend} className="composer">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          placeholder="Type a message…"
          aria-label="Message"
          disabled={sending}
        />
        <button type="submit" disabled={sending || !draft.trim()}>
          Send
        </button>
      </form>
    </main>
  )
}
