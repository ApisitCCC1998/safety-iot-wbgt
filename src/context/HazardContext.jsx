import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useSensor } from './SensorContext.jsx'

const HazardContext = createContext(null)
const STORAGE_KEY = 'safety_hazard_register'

// หมวดหมู่อุบัติการณ์หลักสำหรับกราฟโดนัท
export const INCIDENT_CATEGORIES = [
  { key: 'heatStress', match: ['heat', 'ความร้อน'], label: 'Heat Stress', color: '#ef4444' },
  { key: 'slipFall',   match: ['slip', 'fall', 'ลื่น', 'หกล้ม'], label: 'Slip / Fall', color: '#f97316' },
  { key: 'chemical',   match: ['chemical', 'สารเคมี'], label: 'Chemical', color: '#a855f7' },
  { key: 'electrical', match: ['electrical', 'ไฟฟ้า'], label: 'Electrical', color: '#eab308' },
  { key: 'ergonomic',  match: ['ergonomic', 'การยศาสตร์'], label: 'Ergonomic', color: '#3b82f6' },
]

export function HazardProvider({ children }) {
  const { latestReading } = useSensor()
  const lastAutoAlertTime = useRef(0)

  // ดึงข้อมูลจาก LocalStorage (เริ่มต้นเป็นตารางว่างถ้าไม่เคยมี)
  const [hazards, setHazards] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return []
  })

  // บันทึกลง LocalStorage อัตโนมัติเมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hazards))
  }, [hazards])

  // ── [มิติที่ 2: AUTO HEAT STRESS TRIGGER] ──────────────────────────
  // เมื่อเซ็นเซอร์อ่านค่า WBGT เกินเกณฑ์วิกฤต (เช่น 32.0°C สำหรับงานปานกลาง)
  useEffect(() => {
    const wbgt = latestReading?.wbgt ?? 0
    const now = Date.now()

    // เงื่อนไข: WBGT >= 32.0°C และไม่ส่งเตือนซ้ำภายใน 15 นาที
    if (wbgt >= 32.0 && now - lastAutoAlertTime.current > 15 * 60 * 1000) {
      // ตรวจสอบว่ามีรายการ Heat Stress สถานะ Open อยู่แล้วหรือไม่ ป้องกันขยะข้อมูล
      const alreadyOpen = hazards.some(
        (h) => h.status === 'open' && h.category.toLowerCase().includes('heat')
      )

      if (!alreadyOpen) {
        lastAutoAlertTime.current = now
        const autoId = `HZ-AUTO-${now.toString().slice(-4)}`
        const newAutoIncident = {
          id: autoId,
          timestamp: new Date().toLocaleString('en-GB', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
          }).replace(',', ''),
          area: 'IoT Monitoring Station #1',
          category: 'Heat Stress',
          severity: 'critical',
          status: 'open',
          description: `[Auto-Triggered] ตรวจพบค่า WBGT พุ่งสูงแตะ ${wbgt.toFixed(1)}°C (อุณหภูมิแวดล้อม: ${latestReading?.temp ?? '-'}°C, ความชื้น: ${latestReading?.humidity ?? '-'}%) เกินเกณฑ์มาตรฐานความปลอดภัย`,
        }

        setHazards((prev) => [newAutoIncident, ...prev])
      }
    }
  }, [latestReading, hazards])

  // ฟังก์ชันเพิ่มรายการใหม่แบบ Manual
  const addHazard = (hazardData) => {
    setHazards((prev) => [hazardData, ...prev])
  }

  // ฟังก์ชันล้างรายการทั้งหมด
  const clearAllHazards = () => {
    setHazards([])
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  }

  // ฟังก์ชันรีเซ็ตข้อมูลตัวอย่างกลับมา
  const resetDemoData = (seedData) => {
    setHazards(seedData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData))
  }

  // ── [มิติที่ 1: คำนวณสถิติสดส่งให้กราฟโดนัท] ──────────────────────
  const categoryStats = INCIDENT_CATEGORIES.map((cat) => {
    const count = hazards.filter((h) => {
      const hCat = (h.category || '').toLowerCase()
      return cat.match.some((m) => hCat.includes(m))
    }).length

    return {
      key: cat.key,
      name: cat.label,
      value: count,
      color: cat.color,
    }
  })

  return (
    <HazardContext.Provider
      value={{
        hazards,
        addHazard,
        clearAllHazards,
        resetDemoData,
        categoryStats,
        totalIncidents: hazards.length,
        activeHazardsCount: hazards.filter((h) => h.status === 'open' || h.status === 'inProgress').length,
      }}
    >
      {children}
    </HazardContext.Provider>
  )
}

export function useHazard() {
  const ctx = useContext(HazardContext)
  if (!ctx) throw new Error('useHazard must be used within a HazardProvider')
  return ctx
}