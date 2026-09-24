import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const SensorContext = createContext(null)

const MAX_HISTORY = 60

const EMPTY_READING = {
  temp: null,
  humidity: null,
  globeTemp: null,
  wetBulb: null,
  wbgt: null,
  timestamp: null,
  source: 'waiting',
  mode: 'outdoor',
}

const isLocal = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

const WS_URL = isLocal
  ? 'ws://localhost:3001/ws'
  : 'wss://safety-iot-wbgt.onrender.com/ws'

const API_BASE = isLocal
  ? 'http://localhost:3001'
  : 'https://safety-iot-wbgt.onrender.com'

export function SensorProvider({ children }) {
  const [latestReading, setLatestReading] = useState(EMPTY_READING)
  const [history, setHistory]             = useState([])
  const [isConnected, setIsConnected]     = useState(false)
  const [isDeviceActive, setIsDeviceActive] = useState(false)
  const [currentMode, setCurrentMode]     = useState('outdoor')
  const [logCount, setLogCount]           = useState(0)

  const wsRef          = useRef(null)
  const reconnectRef   = useRef(null)
  const lastPacketTime = useRef(0)

  // ตรวจสอบ Device Heartbeat ทุก 3 วินาที
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      if (lastPacketTime.current === 0 || now - lastPacketTime.current > 15000) {
        setIsDeviceActive(false)
      } else {
        setIsDeviceActive(true)
      }
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // ✅ switchMode: เปลี่ยน UI ทันที + POST ไป Backend
  const switchMode = useCallback(async (newMode) => {
    setCurrentMode(newMode)
    try {
      const res = await fetch(`${API_BASE}/api/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      })
      if (!res.ok) console.warn('[API] /api/mode status:', res.status)
    } catch (e) {
      console.error('[API] Failed to post mode:', e)
    }
  }, [])

  const connectWS = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        if (reconnectRef.current) {
          clearTimeout(reconnectRef.current)
          reconnectRef.current = null
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // ── logCleared ─────────────────────────────
          if (data.type === 'logCleared') {
            setLogCount(0)
            setHistory([])
            return
          }

          // ✅ modeChanged: รับโหมดจาก Backend
          // (เกิดเมื่อ ESP32 หรือ User อื่นเปลี่ยนโหมด)
          if (data.type === 'modeChanged') {
            setCurrentMode(data.mode)
            return
          }

          // ── Sensor Reading ──────────────────────────
          if (data.wbgt !== undefined) {
            // ปฏิเสธ Mock Data
            if (data.source === 'mock') return

            // ✅ ไม่ override mode จาก sensor reading
            // (mode จะ update เฉพาะจาก modeChanged event)

            lastPacketTime.current = Date.now()
            setIsDeviceActive(true)
            setLatestReading(data)
            if (typeof data.logCount === 'number') setLogCount(data.logCount)
            setHistory((prev) => {
              const next = [...prev, data]
              return next.slice(-MAX_HISTORY)
            })
          }
        } catch (e) {
          console.error('[WS] Parse error:', e)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        setIsDeviceActive(false)
        reconnectRef.current = setTimeout(connectWS, 3000)
      }

      ws.onerror = () => ws.close()
    } catch (e) {
      console.error('[WS] Connection error:', e)
      reconnectRef.current = setTimeout(connectWS, 3000)
    }
  }, [])

  useEffect(() => {
    connectWS()
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [connectWS])

  const clearLog = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sensor-data/clear`, { method: 'DELETE' })
      const data = await res.json()
      setLogCount(0)
      setHistory([])
      return data
    } catch (e) {
      console.error('[API] Clear log error:', e)
    }
  }, [])

  return (
    <SensorContext.Provider value={{
      latestReading, history, isConnected, isDeviceActive,
      currentMode, switchMode,
      logCount, clearLog,
    }}>
      {children}
    </SensorContext.Provider>
  )
}

export const useSensor = () => useContext(SensorContext)
