import { useState, useEffect } from 'react'
import '../styles/ServerTime.css'

const ServerTime = () => {
  const [time, setTime] = useState(null)
  const [date, setDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTime = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('http://localhost:3000/time')
      if (!response.ok) throw new Error('Failed to fetch time')
      const data = await response.json()
      const serverDate = new Date(data.time)
      
      setTime(serverDate.toLocaleTimeString('en-US', { hour12: false }))
      setDate(serverDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTime()
    const interval = setInterval(fetchTime, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="server-time-container">
      <h1 className="server-time-title">Server Time</h1>
      
      <div className="time-display-card">
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}
        {time && !loading && !error && (
          <>
            <div className="time-display">{time}</div>
            <div className="date-display">{date}</div>
          </>
        )}
      </div>

      <button onClick={fetchTime} className="refresh-button">
        Refresh
      </button>
    </div>
  )
}

export default ServerTime
