import { useEffect, useState } from 'react'
import './AdminPanel.css'

async function fetchJson(url) {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    throw new Error(`${url} failed (${res.status})`)
  }
  return res.json()
}

/** Mini live preview of a chat room (last lines from /api). */
function ChatPreview({ path }) {
  const [lines, setLines] = useState([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchJson(`/api/${path}/messages`)
        if (!cancelled) setLines((data.messages || []).slice(-4))
      } catch {
        if (!cancelled) setLines([])
      }
    }
    load()
    const id = setInterval(load, 4000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [path])

  return (
    <div className="preview-inner preview-chat" aria-hidden="true">
      <div className="preview-chat-head">
        <span className="preview-chat-title">Room chat</span>
        <span className="preview-chat-meta">room {path}</span>
      </div>
      <ul className="preview-chat-log">
        {lines.length === 0 ? (
          <li className="empty">No messages yet.</li>
        ) : (
          lines.map((line, i) => (
            <li key={`${i}-${line.slice(0, 16)}`}>{line}</li>
          ))
        )}
      </ul>
      <div className="preview-chat-composer">
        <span className="preview-fake-input">Type a message…</span>
        <span className="preview-fake-btn">Send</span>
      </div>
    </div>
  )
}

/** Miniature of the admin layout (no nested live admin). */
function AdminPreview() {
  return (
    <div className="preview-inner preview-admin" aria-hidden="true">
      <div className="preview-admin-bar preview-admin-rooms" />
      <div className="preview-admin-bar preview-admin-guests" />
      <div className="preview-admin-floor">
        <span>Admin</span>
      </div>
    </div>
  )
}

/** Miniature stick-man for character rtype previews. */
function CharacterPreview() {
  return (
    <div className="preview-inner preview-character" aria-hidden="true">
      <svg className="preview-stick" viewBox="0 0 80 120">
        <circle cx="40" cy="18" r="12" />
        <line x1="40" y1="30" x2="40" y2="70" />
        <line x1="40" y1="42" x2="22" y2="58" />
        <line x1="40" y1="42" x2="58" y2="58" />
        <line x1="40" y1="70" x2="26" y2="104" />
        <line x1="40" y1="70" x2="54" y2="104" />
      </svg>
      <span className="preview-character-label">Stick</span>
    </div>
  )
}

function RoomPreviewCard({ room }) {
  const isAdmin = room.rtype === 'admin'
  const isCharacter = room.rtype === 'character'
  return (
    <a
      className="room-preview-card"
      href={`/room/${room.path}`}
      title={`Open ${room.path} (${room.rtype})`}
    >
      <div className="room-preview-stage">
        {isAdmin ? (
          <AdminPreview />
        ) : isCharacter ? (
          <CharacterPreview />
        ) : (
          <ChatPreview path={room.path} />
        )}
      </div>
      <div className="room-preview-caption">
        <span className="room-preview-name">{room.path}</span>
        <span className="room-preview-type">{room.rtype}</span>
      </div>
    </a>
  )
}

export default function AdminPanel() {
  const [error, setError] = useState('')
  const [rooms, setRooms] = useState([])
  const [guests, setGuests] = useState([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [roomsData, guestsData] = await Promise.all([
          fetchJson('/api/admin/rooms'),
          fetchJson('/api/admin/guests'),
        ])
        if (cancelled) return
        setRooms(roomsData.rooms || [])
        setGuests(guestsData.guests || [])
        setError('')
      } catch (err) {
        if (!cancelled) setError(err.message || 'Load failed')
      }
    }

    load()
    const id = setInterval(load, 3000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <main className="admin-shell">
      <header className="admin-hero">
        <p className="admin-brand">Knocknok</p>
        <h1>Admin panel</h1>
        <p className="admin-lead">Live rooms and guests behind the door.</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <section className="admin-block rooms-block" aria-labelledby="rooms-heading">
        <div className="admin-block-head">
          <h2 id="rooms-heading">Rooms</h2>
          <p>Small previews of how each room looks inside.</p>
        </div>
        <div className="preview-row">
          {rooms.length === 0 ? (
            <p className="admin-empty">No rooms yet.</p>
          ) : (
            rooms.map((room) => <RoomPreviewCard key={room.id} room={room} />)
          )}
        </div>
      </section>

      <section className="admin-block guests-block" aria-labelledby="guests-heading">
        <div className="admin-block-head">
          <h2 id="guests-heading">Guests</h2>
          <p>Sessions currently holding a pocket.</p>
        </div>
        <div className="guest-row">
          {guests.length === 0 ? (
            <p className="admin-empty">No guests online.</p>
          ) : (
            guests.map((guest, i) => (
              <div
                key={`${guest.session}-${i}`}
                className="guest-chip"
                title={`pocket: ${guest.pocket}`}
              >
                <span className="guest-chip-id">{guest.session || '?'}</span>
                <span className="guest-chip-pocket">{guest.pocket || '—'}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="admin-block knocks-block" aria-labelledby="knocks-heading">
        <div className="admin-block-head">
          <h2 id="knocks-heading">Knocks</h2>
          <p>Live /data activity comes here next.</p>
        </div>
        <div className="knocks-placeholder">
          <span>Waiting for knock stream…</span>
        </div>
      </section>
    </main>
  )
}
