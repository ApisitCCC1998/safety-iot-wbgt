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

// สลับ URL อัตโนมัติ: localhost หรือ Render
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
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
  const [currentMode, setCurrentMode]     = useState('outdoor') // โหมดคำนวณ WBGT
  const [logCount, setLogCount]           = useState(0)

  const wsRef          = useRef(null)
  const reconnectRef   = useRef(null)
  const lastPacketTime = useRef(0)

  // ตรวจสอบสัญญาณทุกๆ 3 วินาที ถ้าไม่มีข้อมูลจาก ESP32 นานเกิน 15 วินาที ให้ตัดเป็น Offline
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

  // ฟังก์ชันส่งคำสั่งสลับโหมด กลางแจ้ง / ในร่ม ไปที่ Render Cloud
  const switchMode = useCallback(async (newMode) => {
    try {
      const res = await fetch(`${API_BASE}/api/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      })
      if (res.ok) {
        setCurrentMode(newMode)
      }
    } catch (e) {
      console.error('[API] Error switching mode:', e)
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

          if (data.type === 'logCleared') {
            setLogCount(0)
            setHistory([])
            return
          }

          if (data.wbgt !== undefined) {
            // ปฏิเสธ Mock Data
            if (data.source === 'mock') return

            // อัปเดตโหมดตามที่อุปกรณ์แจ้งมา (ถ้ามี)
            if (data.mode) {
              setCurrentMode(data.mode)
            }

            // รับข้อมูลเมื่อมาจากบอร์ดฮาร์ดแวร์จริง (รองรับทั้ง esp32 และ esp32-hardware)
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