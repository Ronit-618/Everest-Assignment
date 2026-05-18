import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Calendar from './pages/Calendar'
import Calculator from './pages/Calculator'
import ServerTime from './pages/ServerTime'
import Files from './pages/Files'
import Users from './pages/Users'

function Navbar() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Calendar' },
    { path: '/calculator', label: 'Calculator' },
    { path: '/time', label: 'Server Time' },
    { path: '/files', label: 'Files' },
    { path: '/users', label: 'Users' }
  ]

  return (
    <nav className="navbar">
      <div className="nav-logo">everest.</div>
      <div className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/time" element={<ServerTime />} />
            <Route path="/files" element={<Files />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
