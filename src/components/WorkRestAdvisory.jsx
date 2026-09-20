import { useState } from 'react'
import { useSensor } from '../context/SensorContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { getTierColors } from '../utils/wbgtLogic.js'
import { Thermometer, ShieldAlert, Info, Briefcase } from 'lucide-react'

// ── ฟังก์ชันสร้างเกณฑ์มาตรฐานตามระดับภาระงาน (กฎกระทรวงฯ พ.ศ. 2559 & ACGIH) ──
function getDynamicTiers(workload) {
  // ค่าขีดจำกัดมาตรฐานตามกฎหมายไทย (Threshold Limit Value)
  const limits = {
    light: 34.0,     // งานเบา (ไม่เกิน 34.0°C)
    moderate: 32.0,  // งานปานกลาง (ไม่เกิน 32.0°C)
    heavy: 30.0,     // งานหนัก (ไม่เกิน 30.0°C)
  }

  const limit = limits[workload] || 32.0

  return [
    {
      tierKey: 'SAFE',
      min: -Infinity,
      max: limit - 2.0,
      range: `< ${(limit - 2.0).toFixed(1)}°C`,
      work: 100,
      rest: 0,
      label: 'Safe',
      advice: 'สภาพแวดล้อมปลอดภัย ปฏิบัติงานได้เต็มเวลา จัดหาน้ำดื่มสะอาดทดแทนตามปกติ',
    },
    {
      tierKey: 'CAUTION',
      min: limit - 2.0,
      max: limit,
      range: `${(limit - 2.0).toFixed(1)} – ${limit.toFixed(1)}°C`,
      work: 75,
      rest: 25,
      label: 'Caution',
      advice: 'เข้าใกล้ขีดจำกัดความปลอดภัย เฝ้าระวังอาการเมื่อยล้า พัก 15 นาทีในที่ร่มทุกชั่วโมง',
    },
    {
      tierKey: 'WARNING',
      min: limit,
      max: limit + 1.5,
      range: `${limit.toFixed(1)} – ${(limit + 1.5).toFixed(1)}°C`,
      work: 50,
      rest: 50,
      label: 'Warning',
      advice: 'เกินเกณฑ์มาตรฐานกฎหมาย! สลับหมุนเวียนคนทำงาน พัก 30 นาทีในจุดที่มีพัดลมระบายอากาศ',
    },
    {
      tierKey: 'DANGER',
      min: limit + 1.5,
      max: Infinity,
      range: `> ${(limit + 1.5).toFixed(1)}°C`,
      work: 25,
      rest: 75,
      label: 'Danger',
      advice: 'ระดับอันตรายวิกฤต! เสี่ยงภาวะโรคลมแดด (Heat Stroke) ควรหยุดงานหรือเลี่ยงแดดจัดทันที',
    },
  ]
}

export default function WorkRestAdvisory() {
  const { latestReading } = useSensor()
  const { t } = useLang()
  const [workload, setWorkload] = useState('moderate') // ค่าเริ่มต้น: งานปานกลาง

  const wbgt = latestReading?.wbgt ?? 0
  const tiers = getDynamicTiers(workload)

  // ค้นหาระดับ Tier ปัจจุบันจากค่า WBGT จริง
  const activeTier = tiers.find((tier) => wbgt < tier.max) || tiers[tiers.length - 1]
  const colors = getTierColors(activeTier.tierKey)

  return (
    <div className="card p-5 h-full flex flex-col gap-4">
      {/* ── Title & Workload Selector ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {t('workRestAdvisory')}
          </h2>
        </div>

        {/* ปุ่มเลือกระดับภาระงาน (Workload) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <Briefcase className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
          {[
            { id: 'light', label: 'งานเบา', limit: '34°C' },
            { id: 'moderate', label: 'ปานกลาง', limit: '32°C' },
            { id: 'heavy', label: 'งานหนัก', limit: '30°C' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setWorkload(item.id)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                workload === item.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={`เกณฑ์มาตรฐานความร้อนกฎหมายไทย: ไม่เกิน ${item.limit}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Current Reading Highlight ── */}
      <div className={`rounded-lg p-4 border-l-4 ${colors.border} bg-slate-50 dark:bg-slate-700/50 shadow-sm transition-all`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('currentStatus')}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600 font-mono text-slate-600 dark:text-slate-300">
                มาตรฐาน ≤ {workload === 'light' ? '34.0' : workload === 'moderate' ? '32.0' : '30.0'}°C
              </span>
            </div>
            <p className={`text-xl font-extrabold tracking-wide mt-0.5 ${colors.text}`}>
              {activeTier.label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">WBGT INDEX</p>
            <p className={`text-2xl font-black tabular-nums ${colors.text}`}>
              {wbgt.toFixed(1)}°C
            </p>
          </div>
        </div>

        {/* แถบ Work / Rest Bar */}
        <div className="mt-3.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            <span>ทำงาน: {activeTier.work}%</span>
            <span>พักผ่อน: {activeTier.rest}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden flex shadow-inner">
            <div
              className={`h-full transition-all duration-700 ${colors.bg}`}
              style={{ width: `${activeTier.work}%` }}
            />
          </div>
        </div>

        {/* กล่องคำแนะนำสำหรับ จป. / หน้างาน */}
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-600/60 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">{activeTier.advice}</p>
        </div>
      </div>

      {/* ── Dynamic Reference Table ── */}
      <div className="flex flex-col gap-1.5 flex-1">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          เกณฑ์รอบการทำงาน/พัก ตามภาระงานที่เลือก
        </p>
        {tiers.map((row) => {
          const c = getTierColors(row.tierKey)
          const isActive = row.tierKey === activeTier.tierKey
          return (
            <div
              key={row.tierKey}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
                isActive
                  ? `border-2 ${c.border} bg-white dark:bg-slate-700 shadow-sm font-semibold`
                  : 'opacity-40 hover:opacity-75 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.bg}`} />
              <div className="flex-1 min-w-0 flex items-center justify-between pr-2">
                <span className={`text-xs ${c.text}`}>{row.label}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{row.range}</span>
              </div>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-nowrap bg-slate-100 dark:bg-slate-600/60 px-2 py-0.5 rounded">
                {row.work}% / {row.rest}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}