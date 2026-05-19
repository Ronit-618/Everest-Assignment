require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const mysql = require('mysql2')
const path = require('path')
const fs = require('fs')
const OpenCC = require('opencc-js')
const geoip = require('fast-geoip')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Multer - disk storage for /upload
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'upload')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const uploadDisk = multer({ storage: diskStorage })

// Multer - memory storage for /validate-json
const uploadMemory = multer({ storage: multer.memoryStorage() })

// MySQL connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

pool.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err)
  } else {
    console.log('MySQL connected successfully')
    connection.release()
  }
})

// Routes

// GET /time
app.get('/time', (req, res) => {
  res.json({ time: new Date().toISOString() })
})

// GET /file
app.get('/file', (req, res) => {
  const filePath = path.join(__dirname, 'hello.txt')
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'hello.txt')
  } else {
    res.status(404).json({ error: 'File not found' })
  }
})

// POST /upload
app.post('/upload', uploadDisk.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  res.json({
    message: 'File uploaded successfully',
    filename: req.file.originalname,
    size: `${req.file.size} bytes`
  })
})

// POST /validate-json
app.post('/validate-json', uploadMemory.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  
  try {
    JSON.parse(req.file.buffer.toString())
    res.json({ valid: true })
  } catch (err) {
    res.json({ valid: false, error: err.message })
  }
})

// GET /users
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM users ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /users
app.post('/users', async (req, res) => {
  const { name, email } = req.body
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' })
  }
  try {
    const [result] = await pool.promise().query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email])
    res.json({ message: 'User created successfully', userId: result.insertId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /convert
app.post('/convert', (req, res) => {
  const { text, mode } = req.body
  
  if (!text || !mode) {
    return res.status(400).json({ error: 'Text and mode are required' })
  }
  
  let converter
  if (mode === 'traditional') {
    converter = OpenCC.Converter({ from: 'cn', to: 'tw' })
  } else if (mode === 'simplified') {
    converter = OpenCC.Converter({ from: 'tw', to: 'cn' })
  } else {
    return res.status(400).json({ error: 'Mode must be "traditional" or "simplified"' })
  }
  
  try {
    const result = converter(text)
    res.json({ converted: result })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /lookup-ip
app.post('/lookup-ip', (req, res) => {
  const { ip } = req.body
  
  if (!ip) {
    return res.status(400).json({ error: 'IP address is required' })
  }
  
  try {
    const geo = geoip.lookup(ip)
    if (geo) {
      res.json({
        country: geo.country,
        region: geo.region,
        city: geo.city,
        lat: geo.ll[0],
        lon: geo.ll[1]
      })
    } else {
      res.json({ error: 'Not found' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`everest-server running on http://localhost:${PORT}`)
  console.log('Routes:')
  console.log('  GET  /time')
  console.log('  GET  /file')
  console.log('  POST /upload')
  console.log('  POST /validate-json')
  console.log('  GET  /users')
  console.log('  POST /users')
  console.log('  POST /convert')
  console.log('  POST /lookup-ip')
})
