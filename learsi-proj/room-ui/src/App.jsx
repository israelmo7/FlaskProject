import { useCallback, useEffect, useState } from 'react'
import Chat from './Chat'
import AdminPanel from './AdminPanel'

/**
 * Room id comes from Flask: <div id="root" data-room-id="1">
 * In Vite dev without Flask, falls back to ?room=1 or "1".
 */



export default function App() {
    const [currentView, setCurrentView] = useState('chat'); // 'chat' או 'admin'
    return (
        <div className="app">
            {currentView === 'chat' && <Chat />}
            {currentView === 'admin' && <AdminPanel />}
            <div className="view-switcher">
                <button onClick={() => setCurrentView('chat')}>Chat</button>
                <button onClick={() => setCurrentView('admin')}>Admin Panel</button>
            </div>
        </div>
    )
}
