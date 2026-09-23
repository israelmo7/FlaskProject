import { useEffect, useState } from 'react'
import './AdminPanel.css'

async function fetchJson(url) {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    throw new Error(`${url} failed (${res.status})`)
  }
  return res.json()
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
          fetchJson('/admin/api/rooms'),
          fetchJson('/admin/api/guests'),
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
    <main className="admin-container">
      <h1>Admin Panel</h1>
      {error ? <p className="error">{error}</p> : null}

      <section className="admin-section rooms-section">
        <h3>Rooms</h3>
        <div className="scroll-row">
          {rooms.length === 0 ? (
            <div className="scroll-item blue-item">No rooms</div>
          ) : (
            rooms.map((room) => (
              <a
                key={room.id}
                className="scroll-item blue-item"
                href={`/room/${room.path}/app`}
                title={room.rtype}
              >
                {room.path}
              </a>
            ))
          )}
        </div>
      </section>

      <section className="admin-section guests-section">
        <h3>Guests</h3>
        <div className="scroll-row">
          {guests.length === 0 ? (
            <div className="scroll-item green-item">No guests</div>
          ) : (
            guests.map((guest, i) => (
              <div
                key={`${guest.session}-${i}`}
                className="scroll-item green-item"
                title={`pocket: ${guest.pocket}`}
              >
                {guest.session || '?'}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="admin-section bottom-section">
        <h3>Knocks (later)</h3>
        <div className="graph-box">
          <p>Live /data/* knocks go here next.</p>
        </div>
      </section>
    </main>
  )
}
