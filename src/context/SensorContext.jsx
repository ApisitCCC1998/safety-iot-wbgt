import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const SensorContext = createContext(null)

const MAX_HISTORY = 60 // เก็บข้อมูล 60 จุดล่าสุดสำหรับกราฟแนวโน้ม

// ── ค่าเริ่มต้นเป็นค่าว่าง เพื่อรอสัญญาณจริงจาก ESP32 ───────────────────────────
const EMPTY_READING = {
  temp: null,
  humidity: null,
  globeTemp: null,
  wbgt: null,
  timestamp: null,
  source: 'waiting',
}

// ── สลับ URL อัตโนมัติ: localhost หรือ Render ───────────────────────────────────
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const WS_URL = isLocal 
  ? 'ws://localhost:3001/ws' 
  : 'wss://safety-iot-wbgt.onrender.com/ws'

const API_BASE = isLocal 
  ? 'http://localhost:3001' 
  : 'https://safety-iot-wbgt.onrender.com'

export function SensorProvider({ children }) {
  const [latestReading, setLatestReading] = useState(EMPTY_READING)
  const [history, setHistory]             = useState([]) // เริ่มต้นเป็นตารางว่าง ไม่นำค่าจำลองมาพล็อต
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

          // ── Status / Control messages ──────────────────────────────
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

          // ── กรองข้อมูล: ปฏิเสธ Mock Data รับเฉพาะข้อมูลจาก ESP32 จริง ──
          if (data.wbgt !== undefined) {
            // หากข้อมูลระบุว่าเป็น mock ให้ตัดทิ้งทันที
            if (data.source === 'mock') {
              return
            }

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