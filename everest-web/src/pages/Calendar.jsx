import { useState } from 'react'
import '../styles/Calendar.css'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleYearChange = (e) => {
    setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth()))
  }

  const handleDateClick = (day) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
  }

  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  const getWeekdayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const isToday = (day) => {
    const today = new Date()
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear()
  }

  const isSelected = (day) => {
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear()
  }

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth())
  const years = Array.from({ length: 201 }, (_, i) => 1900 + i)

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      <div
        key={day}
        className={`calendar-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
        onClick={() => handleDateClick(day)}
      >
        {day}
      </div>
    )
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1 className="calendar-title">Calendar</h1>
        <div className="selected-date">
          <span className="date-display">{formatDate(selectedDate)}</span>
          <span className="weekday-display">{getWeekdayName(selectedDate)}</span>
        </div>
      </div>
      
      <div className="calendar-navigation">
        <button onClick={handlePrevMonth}>&larr; Previous</button>
        <div className="month-year">
          <span className="month-name">
            {currentDate.toLocaleDateString('en-US', { month: 'long' })}
          </span>
          <select value={currentDate.getFullYear()} onChange={handleYearChange} className="year-select">
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <button onClick={handleNextMonth}>Next &rarr;</button>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-header-day">{day}</div>
        ))}
        {days}
      </div>
    </div>
  )
}

export default Calendar
