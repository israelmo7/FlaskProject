import { useCallback, useEffect, useState } from 'react'
import './chat.css'

function readRoomPath() {
  const fromDom = document.getElementById('root')?.dataset?.roomPath
  if (fromDom) return fromDom
  const q = new URLSearchParams(window.location.search).get('room')
  return q || '1'
}

async function fetchMessages(roomPath) {
  const res = await fetch(`/api/${roomPath}/messages`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`load failed (${res.status})`)
  }
  const data = await res.json()
  return data.messages || []
}

async function postMessage(roomPath, message) {
  const res = await fetch(`/api/${roomPath}/messages`, {
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

export default function Chat() {

    const roomPath = readRoomPath()
      const [messages, setMessages] = useState([])
      const [draft, setDraft] = useState('')
      const [error, setError] = useState('')
      const [sending, setSending] = useState(false)
    
      const load = useCallback(async () => {
        try {
          const lines = await fetchMessages(roomPath)
          setMessages(lines)
          setError('')
        } catch (err) {
          setError(err.message || 'Could not load messages')
        }
      }, [roomPath])
    
      // First load + poll every 2 seconds
      useEffect(() => {
        load()
        const id = setInterval(load, 2000)
        return () => clearInterval(id)
      }, [load])
    
      async function handleOpenWindow() {
        const url = `/room/${roomPath}/app`
        window.open(url, '_blank', 'width=400,height=600')
      }
      async function onSend(e) {
        e.preventDefault()
        const text = draft.trim()
        if (!text || sending) return
    
        setSending(true)
        setDraft('')
        // Optimistic: show your line immediately
        setMessages((prev) => [...prev, text])
        try {
          const lines = await postMessage(roomPath, text)
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
            <p className="meta">room {roomPath}</p>
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
          <button type="button" onClick={handleOpenWindow}>
            Open in new window
          </button>
        </main>
      )
    }