import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const SensorContext = createContext(null)

const MAX_HISTORY = 60  // keep last 60 readings for trend chart

const DEFAULT_READING = {
  temp: 34.5,
  humidity: 72.0,
  globeTemp: 38.0,
  wbgt: 30.5,
  timestamp: new Date().toISOString(),
  source: 'init',
}

// ── สลับ URL อัตโนมัติ: ถ้าเปิดในเครื่องใช้ localhost ถ้าเปิดบน Vercel ให้ชี้ไปที่ Render ──
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const WS_URL = isLocal 
  ? 'ws://localhost:3001/ws' 
  : 'wss://safety-iot-wbgt.onrender.com/ws'

const API_BASE = isLocal 
  ? 'http://localhost:3001' 
  : 'https://safety-iot-wbgt.onrender.com'

export function SensorProvider({ children }) {
  const [latestReading, setLatestReading] = useState(DEFAULT_READING)
  const [history, setHistory]             = useState([DEFAULT_READING])
  const [isConnected, setIsConnected]     = useState(false)
  const [isStreaming, setIsStreaming]     = useState(true)
  const [logCount, setLogCount]           = useState(0)
  const wsRef        = useRef(null)
  const reconnectRef = useRef(null)

  const connectWS = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('[WS] Connected successfully to:', WS_URL)
        setIsConnected(true)
        if (reconnectRef.current) {
          clearTimeout(reconnectRef.current)
          reconnectRef.current = null
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // ── Status / control messages ──────────────────────────────
          if (data.type === 'status') {
            setIsStreaming(data.isStreaming)
            if (typeof data.logCount === 'number') setLogCount(data.logCount)
            return
          }
          if (data.type === 'logCleared') {
            setLogCount(0)
            setHistory([])
            return
          }

          // ── Sensor reading ─────────────────────────────────────────
          if (data.wbgt !== undefined) {
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

  const toggleStream = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/mock/toggle`, { method: 'POST' })
      const data = await res.json()
      setIsStreaming(data.isStreaming)
    } catch (e) {
      console.error('[API] Toggle error:', e)
    }
  }, [])

  /** Clear backend sensor log and reset local counter */
  const clearLog = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/sensor-data/clear`, { method: 'DELETE' })
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
      latestReading, history, isConnected, isStreaming,
      logCount, toggleStream, clearLog,
    }}>
      {children}
    </SensorContext.Provider>
  )
}

export const useSensor = () => useContext(SensorContext)