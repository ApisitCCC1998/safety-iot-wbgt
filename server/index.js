import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import cors from 'cors'
import { startSimulator, stopSimulator, isSimulatorRunning } from './mockSimulator.js'

const PORT = 3001
const app = express()

app.use(cors())
app.use(express.json())

// ─── Mode Management (Indoor / Outdoor) ──────────────────────────────────────
let currentMode = 'outdoor' // ค่าเริ่มต้น: กลางแจ้ง (outdoor)

// ─── In-Memory Sensor Log ─────────────────────────────────────────────────────
const sensorLogs = []
const MAX_LOGS = 10_000 // rolling window — prevents unbounded memory growth

/**
 * Format an ISO timestamp to Thailand local time: YYYY-MM-DD HH:mm:ss
 */
function formatLocalTime(iso) {
  return new Date(iso).toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace('T', ' ')
}

/**
 * Append one sensor reading to the in-memory log.
 * Drops oldest entry when MAX_LOGS is reached.
 */
function logReading(payload) {
  if (!payload?.wbgt) return
  if (sensorLogs.length >= MAX_LOGS) sensorLogs.shift()
  sensorLogs.push({
    timestamp: payload.timestamp ?? new Date().toISOString(),
    localTime: formatLocalTime(payload.timestamp ?? new Date().toISOString()),
    mode:      payload.mode || currentMode,
    temp:      payload.temp,
    humidity:  payload.humidity,
    globeTemp: payload.globeTemp,
    wetBulb:   payload.wetBulb ?? null,
    wbgt:      payload.wbgt,
  })
}

// ─── WebSocket Server ─────────────────────────────────────────────────────────
const httpServer = createServer(app)
const wss = new WebSocketServer({ server: httpServer, path: '/ws' })

/** Broadcast a sensor reading — always includes current log count and mode */
function broadcastSensor(payload) {
  const message = JSON.stringify({ ...payload, mode: currentMode, logCount: sensorLogs.length })
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message)
  })
}

/** Broadcast a control/status message */
function broadcastControl(data) {
  const message = JSON.stringify(data)
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message)
  })
}

wss.on('connection', (ws) => {
  console.log(`[WS] Client connected — total: ${wss.clients.size}`)
  // ส่งสถานะปัจจุบันและโหมดให้ client ทันทีที่เชื่อมต่อ
  ws.send(JSON.stringify({
    type: 'status',
    isStreaming: isSimulatorRunning(),
    mode: currentMode,
    logCount: sensorLogs.length,
  }))
  ws.on('close', () => console.log(`[WS] Client disconnected — total: ${wss.clients.size}`))
  ws.on('error', (err) => console.error('[WS] Error:', err.message))
})

// ─── REST Endpoints: System & Health ──────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    wsClients: wss.clients.size,
    currentMode,
    mockRunning: isSimulatorRunning(),
    logCount: sensorLogs.length,
    timestamp: new Date().toISOString(),
  })
})

// ── Mode Management Endpoints ─────────────────────────────────────────────────

// 1. ให้ ESP32 หรือ Dashboard ดึงโหมดปัจจุบัน (GET)
app.get('/api/mode', (_req, res) => {
  res.json({ mode: currentMode })
})

// 2. ให้ Dashboard สั่งเปลี่ยนโหมด (POST)
app.post('/api/mode', (req, res) => {
  const { mode } = req.body || {}
  if (mode === 'indoor' || mode === 'outdoor') {
    currentMode = mode
    console.log(`[Mode] Switched to: ${currentMode}`)
    broadcastControl({ type: 'modeChanged', mode: currentMode })
    res.json({ success: true, mode: currentMode })
  } else {
    res.status(400).json({ error: "Invalid mode. Must be 'indoor' or 'outdoor'" })
  }
})

// ── Sensor Data ───────────────────────────────────────────────────────────────

// Receive real sensor data from ESP32
app.post('/api/sensor-data', (req, res) => {
  const { temp, humidity, globeTemp, wbgt, wetBulb, mode } = req.body

  if (
    typeof temp      !== 'number' ||
    typeof humidity  !== 'number' ||
    typeof globeTemp !== 'number' ||
    typeof wbgt      !== 'number'
  ) {
    return res.status(400).json({
      error: 'Invalid payload. Expected: { temp, humidity, globeTemp, wbgt } — all numbers',
    })
  }

  // อัปเดตโหมดตามที่อุปกรณ์แจ้งมา (ถ้ามี)
  if (mode === 'indoor' || mode === 'outdoor') {
    currentMode = mode
  }

  const payload = {
    temp,
    humidity,
    globeTemp,
    wetBulb: wetBulb ?? null,
    wbgt,
    mode: currentMode,
    timestamp: new Date().toISOString(),
    source: 'esp32',
    type: 'sensor',
  }

  logReading(payload)
  broadcastSensor(payload)
  console.log(`[API] ESP32 reading logged & broadcasted [Mode: ${currentMode}]. Total logs: ${sensorLogs.length}`)
  res.json({ status: 'broadcasted', mode: currentMode, clients: wss.clients.size, logCount: sensorLogs.length })
})

// Export logged data as CSV
app.get('/api/sensor-data/export-csv', (_req, res) => {
  const slug = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')
  const filename = `wbgt_sensor_data_${slug}.csv`

  const CSV_HEADERS = [
    'Timestamp',
    'Local_Time',
    'Mode',
    'Ambient_Temp_C',
    'Relative_Humidity_Pct',
    'Globe_Temp_C',
    'Wet_Bulb_C',
    'WBGT_C',
  ]

  const rows = sensorLogs.map((r) =>
    [
      r.timestamp,
      r.localTime,
      r.mode || 'outdoor',
      r.temp,
      r.humidity,
      r.globeTemp,
      r.wetBulb ?? '',
      r.wbgt,
    ].join(',')
  )

  const csv = [CSV_HEADERS.join(','), ...rows].join('\r\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send('\uFEFF' + csv)
  console.log(`[API] CSV exported — ${sensorLogs.length} rows → ${filename}`)
})

// Get current log count
app.get('/api/sensor-data/count', (_req, res) => {
  res.json({ count: sensorLogs.length })
})

// Clear all logged data
app.delete('/api/sensor-data/clear', (_req, res) => {
  const cleared = sensorLogs.length
  sensorLogs.length = 0
  broadcastControl({ type: 'logCleared', logCount: 0 })
  console.log(`[API] Sensor log cleared — removed ${cleared} entries`)
  res.json({ cleared, message: 'Sensor log cleared successfully' })
})

// ── Mock Simulator Toggle ─────────────────────────────────────────────────────

app.post('/api/mock/toggle', (_req, res) => {
  if (isSimulatorRunning()) {
    stopSimulator()
    broadcastControl({ type: 'status', isStreaming: false })
    res.json({ isStreaming: false })
  } else {
    startSimulator((reading) => {
      logReading(reading)
      broadcastSensor({ ...reading, type: 'sensor', source: 'mock' })
    })
    broadcastControl({ type: 'status', isStreaming: true })
    res.json({ isStreaming: true })
  }
})

app.get('/api/mock/status', (_req, res) => {
  res.json({ isStreaming: isSimulatorRunning() })
})

// ─── Start Server ─────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Safety IoT Backend running on http://localhost:${PORT}`)
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/ws`)
  console.log(`📊 CSV export: GET http://localhost:${PORT}/api/sensor-data/export-csv`)
  console.log(`🗑️  Clear log:  DELETE http://localhost:${PORT}/api/sensor-data/clear`)
  console.log(`⚙️  WBGT Mode:  GET/POST http://localhost:${PORT}/api/mode\n`)

  // หมายเหตุ: ปิดการรัน Mock Simulator อัตโนมัติ เพื่อรับเฉพาะข้อมูลจริงจากบอร์ด ESP32
})