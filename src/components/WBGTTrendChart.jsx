import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { useSensor } from '../context/SensorContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { CHART_REF_LINE } from '../utils/wbgtLogic.js'
import { TrendingUp, Download, Trash2, Database } from 'lucide-react'

// ── ตรวจสอบ URL อัตโนมัติ: ชี้ไป Render เมื่ออยู่บนเว็บจริง ──────────────────────
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const API_BASE = isLocal ? 'http://localhost:3001' : 'https://safety-iot-wbgt.onrender.com'

function formatTime(timestamp) {
  if (!timestamp) return ''
  try {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ''
  }
}

const CustomTooltip = ({ active, payload, label, t }) => {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value
  return (
    <div className="card px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-orange-500">
        {t('wbgtValue')}: <span className="tabular-nums">{value?.toFixed(2)}°C</span>
      </p>
    </div>
  )
}

export default function WBGTTrendChart() {
  const { history, logCount, clearLog } = useSensor()
  const { t } = useLang()
  const { isDark } = useTheme()
  const [isClearing, setIsClearing] = useState(false)

  const chartData = history.map((r) => ({
    time: formatTime(r.timestamp),
    wbgt: parseFloat(r.wbgt?.toFixed(2)),
  }))

  const gridColor   = isDark ? '#334155' : '#e2e8f0'
  const textColor   = isDark ? '#94a3b8' : '#64748b'
  const lineColor   = '#f97316'

  const handleClearLog = async () => {
    const confirmed = window.confirm(t('confirmClearLog'))
    if (!confirmed) return

    setIsClearing(true)
    try {
      await clearLog()
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="card p-5 h-full flex flex-col gap-4">
      {/* Header bar with controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {t('wbgtTrend')}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Live counter of logged data points */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-300"
            title={`${logCount} logged sensor data points in current session`}
          >
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span>
              {t('loggedPoints')}: <strong className="font-mono text-slate-800 dark:text-slate-100">{logCount}</strong> {t('points')}
            </span>
          </div>

          {/* Export Sensor Log CSV - ดึงตรงจาก Render */}
          <a
            href={`${API_BASE}/api/sensor-data/export-csv`}
            download
            className="btn-ghost text-xs !px-3 !py-1.5 flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700"
            title={t('exportSensorLog')}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('exportSensorLog')}</span>
            <span className="sm:hidden">CSV</span>
          </a>

          {/* Clear Log button with confirmation */}
          <button
            onClick={handleClearLog}
            disabled={isClearing || logCount === 0}
            className="btn-ghost text-xs !px-2.5 !py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
            title={t('clearLog')}
            aria-label={t('clearLog')}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('clearLog')}</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 min-h-[220px]">
        {chartData.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-xs text-slate-400 dark:text-slate-500 gap-1 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <TrendingUp className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            <p>Waiting for sensor points...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="time"
                tick={{ fill: textColor, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: textColor, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}°`}
              />
              <Tooltip content={<CustomTooltip t={t} />} />
              <ReferenceLine
                y={CHART_REF_LINE}
                stroke="#ef4444"
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{ value: t('thresholdLine'), fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
              />
              <Line
                type="monotone"
                dataKey="wbgt"
                name={t('wbgtValue')}
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: lineColor, stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}