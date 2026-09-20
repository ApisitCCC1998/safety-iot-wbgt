import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useLang } from '../context/LangContext.jsx'
import { PieChart as PieChartIcon, Trash2, RotateCcw, CheckCircle2 } from 'lucide-react'

const STORAGE_KEY = 'safety_incident_stats'

const DEFAULT_INCIDENTS = [
  { key: 'heatStress', value: 14, color: '#ef4444' },
  { key: 'slipFall',   value: 8,  color: '#f97316' },
  { key: 'chemical',   value: 5,  color: '#a855f7' },
  { key: 'electrical', value: 4,  color: '#eab308' },
  { key: 'ergonomic',  value: 9,  color: '#3b82f6' },
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold">{name}</p>
      <p className="text-slate-500 dark:text-slate-400">{value} incidents</p>
    </div>
  )
}

const CustomLegend = ({ payload }) => (
  <div className="flex flex-col gap-1.5 mt-2">
    {payload?.map((entry) => (
      <div key={entry.value} className="flex items-center gap-2 text-xs">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
        <span className="text-slate-600 dark:text-slate-300 flex-1 truncate">{entry.value}</span>
        <span className="font-mono text-slate-400 dark:text-slate-500">{entry.payload?.value}</span>
      </div>
    ))}
  </div>
)

export default function IncidentDonutChart() {
  const { t } = useLang()

  // ดึงค่าที่บันทึกไว้ใน LocalStorage หรือใช้ค่าเริ่มต้น
  const [incidentList, setIncidentList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse saved incident stats:', e)
    }
    return DEFAULT_INCIDENTS
  })

  // ฟังก์ชันล้างค่าสถิติทั้งหมดเป็น 0
  const handleClear = () => {
    const confirmed = window.confirm('คุณต้องการล้างสถิติอุบัติการณ์ทั้งหมดเป็น 0 ใช่หรือไม่?')
    if (!confirmed) return

    const cleared = incidentList.map((item) => ({ ...item, value: 0 }))
    setIncidentList(cleared)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleared))
  }

  // ฟังก์ชันดึงข้อมูลตัวอย่างกลับมา (สำหรับนำเสนอหรือทดสอบ)
  const handleReset = () => {
    setIncidentList(DEFAULT_INCIDENTS)
    localStorage.removeItem(STORAGE_KEY)
  }

  const data = incidentList.map((d) => ({ ...d, name: t(d.key) }))
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="card p-5 h-full flex flex-col gap-4">
      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {t('incidentBreakdown')}
          </h2>
        </div>

        {/* ปุ่มควบคุม Clear / Reset */}
        <div className="flex items-center gap-1.5">
          {total === 0 && (
            <button
              onClick={handleReset}
              className="btn-ghost text-xs !px-2.5 !py-1 text-slate-500 hover:text-blue-600 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
              title="โหลดข้อมูลตัวอย่างกลับมา"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Data</span>
            </button>
          )}

          <button
            onClick={handleClear}
            disabled={total === 0}
            className="btn-ghost text-xs !px-2.5 !py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            title="ล้างสถิติอุบัติการณ์ทั้งหมดให้โล่ง"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* ── Content Body ── */}
      {total === 0 ? (
        <div className="flex-1 min-h-[200px] flex flex-col items-center justify-center text-xs text-slate-400 dark:text-slate-500 gap-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          <div>
            <p className="font-bold text-sm text-slate-700 dark:text-slate-200">ไม่มีรายงานอุบัติการณ์ (Zero Incident)</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              สถิติอุบัติการณ์ทั้งหมดถูกรีเซ็ตเรียบร้อย สภาพแวดล้อมการทำงานปลอดภัย
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius="48%"
                outerRadius="68%"
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                content={<CustomLegend />}
                layout="vertical"
                align="center"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500">
        Total: <span className="font-bold text-slate-600 dark:text-slate-300">{total}</span> incidents recorded
      </div>
    </div>
  )
}