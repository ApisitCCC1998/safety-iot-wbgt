import { useState, useMemo } from 'react'
import { useSensor } from '../context/SensorContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { AlertOctagon, Clock, Flame, ChevronRight, CalendarClock, CheckCircle } from 'lucide-react'

// เกณฑ์กฎกระทรวงกำหนดมาตรฐานความร้อนฯ พ.ศ. 2559
const THRESHOLD_CONFIGS = [
  {
    id: 'heavy',
    limit: 30.0,
    title: 'งานหนัก',
    subtitle: 'เกณฑ์กฎหมาย ≤ 30.0°C',
    badgeColor: 'bg-red-500/10 text-red-500 border-red-500/30',
    accentColor: 'text-red-500',
    barColor: 'bg-red-500',
  },
  {
    id: 'moderate',
    limit: 32.0,
    title: 'งานปานกลาง',
    subtitle: 'เกณฑ์กฎหมาย ≤ 32.0°C',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    accentColor: 'text-amber-500',
    barColor: 'bg-amber-500',
  },
  {
    id: 'light',
    limit: 34.0,
    title: 'งานเบา',
    subtitle: 'เกณฑ์กฎหมาย ≤ 34.0°C',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    accentColor: 'text-blue-500',
    barColor: 'bg-blue-500',
  },
]

function formatTimeOnly(dateStr) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return '-'
  }
}

export default function ThresholdStats() {
  const { history } = useSensor()
  const { t } = useLang()
  const [selectedThreshold, setSelectedThreshold] = useState('heavy')

  // ── รวมสถิติการเกินเกณฑ์เป็น Episode ต่อเนื่อง ──────────────────
  const stats = useMemo(() => {
    // เรียงลำดับเวลาจากอดีตไปหาปัจจุบัน
    const sorted = [...(history || [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    const result = {}

    THRESHOLD_CONFIGS.forEach((cfg) => {
      const episodes = []
      let currentEp = null

      sorted.forEach((item) => {
        const wbgt = item.wbgt ?? 0
        if (wbgt >= cfg.limit) {
          if (!currentEp) {
            currentEp = {
              startTime: item.timestamp,
              endTime: item.timestamp,
              peakWbgt: wbgt,
              readingsCount: 1,
            }
          } else {
            currentEp.endTime = item.timestamp
            currentEp.peakWbgt = Math.max(currentEp.peakWbgt, wbgt)
            currentEp.readingsCount += 1
          }
        } else {
          if (currentEp) {
            episodes.push(currentEp)
            currentEp = null
          }
        }
      })

      if (currentEp) {
        episodes.push(currentEp)
      }

      // เรียงจากเหตุการณ์ล่าสุดขึ้นก่อน
      result[cfg.id] = episodes.reverse()
    })

    return result
  }, [history])

  const activeConfig = THRESHOLD_CONFIGS.find((c) => c.id === selectedThreshold) || THRESHOLD_CONFIGS[0]
  const currentEpisodes = stats[activeConfig.id] || []

  return (
    <div className="card p-5 h-full flex flex-col gap-4">
      {/* ── Title Header ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            สถิติการเกินเกณฑ์ความร้อนสะสม
          </h2>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
          ตรวจจับตามประวัติเซ็นเซอร์
        </span>
      </div>

      {/* ── Threshold Selector Cards (สรุปยอดจำนวนครั้งของแต่ละเกณฑ์) ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {THRESHOLD_CONFIGS.map((cfg) => {
          const episodes = stats[cfg.id] || []
          const count = episodes.length
          const isSelected = selectedThreshold === cfg.id

          return (
            <button
              key={cfg.id}
              onClick={() => setSelectedThreshold(cfg.id)}
              className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{cfg.title}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${cfg.badgeColor}`}>
                  &gt;{cfg.limit}°C
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`text-2xl font-black tabular-nums ${count > 0 ? cfg.accentColor : 'text-slate-400'}`}>
                  {count}
                </span>
                <span className="text-xs text-slate-400">ครั้ง</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {count > 0 ? `ล่าสุด: ${formatTimeOnly(episodes[0].startTime)}` : 'ไม่พบค่าเกินเกณฑ์'}
              </p>
            </button>
          )
        })}
      </div>

      {/* ── Detail Table / List (แจกแจงช่วงเวลาที่เกินเกณฑ์) ── */}
      <div className="flex-1 flex flex-col min-h-[190px]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
            บันทึกช่วงเวลาที่เกินเกณฑ์: <span className={activeConfig.accentColor}>{activeConfig.title} (&gt;{activeConfig.limit}°C)</span>
          </p>
          <span className="text-xs text-slate-400">พบ {currentEpisodes.length} เหตุการณ์</span>
        </div>

        {currentEpisodes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center text-xs text-slate-400 gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">ไม่พบช่วงเวลาที่เกินเกณฑ์{activeConfig.title}</p>
            <p className="text-[11px] text-slate-400">อุณหภูมิสะสมอยู่ในระดับความปลอดภัยตามมาตรฐาน</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[220px] rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/60">
            {currentEpisodes.map((ep, idx) => {
              const start = formatTimeOnly(ep.startTime)
              const end = formatTimeOnly(ep.endTime)
              const isSameTime = start === end

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-mono text-[11px] text-slate-500 font-bold">
                      {currentEpisodes.length - idx}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{isSameTime ? start : `${start} – ${end}`}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {ep.readingsCount} จุดตรวจวัดต่อเนื่อง
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end font-semibold text-rose-500">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="font-mono text-sm">{ep.peakWbgt?.toFixed(1)}°C</span>
                    </div>
                    <span className="text-[10px] text-slate-400">อุณหภูมิสูงสุด</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}