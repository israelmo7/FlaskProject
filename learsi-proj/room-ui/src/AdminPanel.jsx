import { useState, useEffect } from 'react'
import './AdminPanel.css'

export default function AdminPanel() {
    const [error, setError] = useState('')
    const [rooms, setRooms] = useState([])
    const [keys, setKeys] = useState([])

    return (
        <main className="AdminPanel">
            <h1>Admin Panel</h1>
            <section className="rooms-section">
                <h3>Rooms</h3>
                <div className="scroll-row">
                    {topImages.map((imgId) => (
                        <div 
                        key={imgId}
                        onClick={() => handleImageClick(imgId)}
                        className="scroll-item blue-item"
                        >
                        תמונה {imgId}
                        </div>
                    ))}
                </div>
            </section>

            <section className="admin-section guests-section">
                <h3>רשימה אמצעית (גלילה אופקית)</h3>
                <div className="scroll-row">
                {middleImages.map((imgId) => (
                    <div 
                    key={imgId}
                    onClick={() => handleImageClick(imgId)}
                    className="scroll-item green-item"
                    >
                    פריט {imgId}
                    </div>
                ))}
                </div>
            </section>

      {/* 3. אזור תחתון - גרפי */}
      <section className="admin-section bottom-section">
        <h3>אזור גרפי / לוח בקרה</h3>
        <div className="graph-box">
          <p>כאן אפשר למקם גרף, טבלה או נתוני מערכת ויזואליים</p>
        </div>
      </section>

    </main>
    )
}