import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts'
import { useSensor } from '../context/SensorContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { TrendingUp, Download, Trash2, Database, Sliders } from 'lucide-react'

const isLocal = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const API_BASE = isLocal ? 'http://localhost:3001' : 'https://safety-iot-wbgt.onrender.com'

// ✅ เพิ่ม 28°C สำหรับเกณฑ์เริ่มแจ้งเตือน กฎกระทรวงฯ 2559
const THRESHOLDS = [
  { id: 'alert',    y: 28.0, label: 'เริ่มแจ้งเตือน (28°C)', color: '#22c55e' },
  { id: 'heavy',    y: 30.0, label: 'งานหนัก (30°C)',         color: '#ef4444' },
  { id: 'moderate', y: 32.0, label: 'งานปานกลาง (32°C)',      color: '#f59e0b' },
  { id: 'light',    y: 34.0, label: 'งานเบา (34°C)',           color: '#3b82f6' },
]

function formatTime(timestamp) {
  if (!timestamp) return ''
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  } catch {
    return ''
  }
}

// ✅ Tooltip แสดง WBGT + Tnw
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const wbgt = payload.find((p) => p.dataKey === 'wbgt')
  const tnw  = payload.find((p) => p.dataKey === 'tnw')
  return (
    <div className="card px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      {wbgt && (
        <p className="font-bold text-orange-500">
          WBGT: <span className="tabular-nums">{wbgt.value?.toFixed(2)}°C</span>
        </p>
      )}
      {tnw && tnw.value != null && (
        <p className="font-semibold text-teal-500">
          Tnw: <span className="tabular-nums">{tnw.value?.toFixed(2)}°C</span>
        </p>
      )}
    </div>
  )
}

export default function WBGTTrendChart() {
  const { history, logCount, clearLog } = useSensor()
  const { t } = useLang()
  const { isDark } = useTheme()
  const [isClearing, setIsClearing]       = useState(false)
  const [showThresholds, setShowThresholds] = useState(true)
  const [showTnw, setShowTnw]             = useState(true) // ✅ toggle Tnw line

  // ✅ เพิ่ม tnw ใน chartData
  const chartData = history.map((r) => ({
    time: formatTime(r.timestamp),
    wbgt: r.wbgt  != null ? parseFloat(r.wbgt.toFixed(2))  : null,
    tnw:  r.wetBulb != null ? parseFloat(r.wetBulb.toFixed(2)) : null,
  }))

  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  const handleClearLog = async () => {
    const confirmed = window.confirm(t('confirmClearLog'))
    if (!confirmed) return
    setIsClearing(true)
    try { await clearLog() } finally { setIsClearing(false) }
  }

  return (
    <div className="card p-5 h-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {t('wbgtTrend')}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Toggle เส้นเกณฑ์ */}
          <button
            onClick={() => setShowThresholds((p) => !p)}
            className={`btn-ghost text-xs !px-2.5 !py-1 flex items-center gap-1 border transition-all ${
              showThresholds
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
            title="เปิด/ปิดเส้นเกณฑ์มาตรฐาน"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">เกณฑ์มาตรฐาน</span>
          </button>

          {/* ✅ Toggle เส้น Tnw */}
          <button
            onClick={() => setShowTnw((p) => !p)}
            className={`btn-ghost text-xs !px-2.5 !py-1 flex items-center gap-1 border transition-all ${
              showTnw
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/20'
                : 'border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
            title="เปิด/ปิดเส้น Tnw (Wet Bulb)"
          >
            <span className="w-3 h-0.5 border-b-2 border-dashed inline-block border-teal-500" />
            <span className="hidden sm:inline">Tnw</span>
          </button>

          {/* Logged count */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-300">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span>
              {t('loggedPoints')}: <strong className="font-mono text-slate-800 dark:text-slate-100">{logCount}</strong>
            </span>
          </div>

          {/* Export CSV */}
          <a
            href={`${API_BASE}/api/sensor-data/export-csv`}
            download
            className="btn-ghost text-xs !px-3 !py-1 flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('exportSensorLog')}</span>
            <span className="sm:hidden">CSV</span>
          </a>

          {/* Clear Log */}
          <button
            onClick={handleClearLog}
            disabled={isClearing || logCount === 0}
            className="btn-ghost text-xs !px-2 !py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Legend เส้นมาตรฐาน */}
      {showThresholds && (
        <div className="flex items-center gap-4 text-[11px] px-1 flex-wrap text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-400 dark:text-slate-500">
            เกณฑ์กฎหมายไทย:
          </span>
          {THRESHOLDS.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5">
              <span
                className="w-3 h-0.5 border-b-2 border-dashed inline-block"
                style={{ borderColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
          {/* ✅ Legend Tnw */}
          {showTnw && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b-2 border-dashed inline-block border-teal-500" />
              <span className="text-teal-500">Tnw — กระเปาะเปียก</span>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 min-h-[230px]">
        {chartData.length === 0 ? (
          <div className="h-full min-h-[230px] flex flex-col items-center justify-center text-xs text-slate-400 dark:text-slate-500 gap-1 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <TrendingUp className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            <p>Waiting for sensor points...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="time"
                tick={{ fill: textColor, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              {/* ✅ Y-axis เริ่มที่ 24°C เพื่อให้เห็นเส้น 28°C */}
              <YAxis
                domain={[
                  (dataMin) => Math.min(Math.floor(dataMin || 24), 24),
                  (dataMax) => Math.max(Math.ceil(dataMax || 35), 35),
                ]}
                tick={{ fill: textColor, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}°`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* เส้นเกณฑ์มาตรฐาน */}
              {showThresholds &&
                THRESHOLDS.map((item) => (
                  <ReferenceLine
                    key={item.id}
                    y={item.y}
                    stroke={item.color}
                    strokeDasharray="5 4"
                    strokeWidth={1.5}
                    label={{
                      value: `${item.y}°C`,
                      fill: item.color,
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />
                ))}

              {/* ✅ เส้น Tnw (Wet Bulb) */}
              {showTnw && (
                <Line
                  type="monotone"
                  dataKey="tnw"
                  name="Tnw (Wet Bulb)"
                  stroke="#14b8a6"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  activeDot={{ r: 3, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive={false}
                  connectNulls
                />
              )}

              {/* เส้น WBGT หลัก */}
              <Line
                type="monotone"
                dataKey="wbgt"
                name="WBGT"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
