import { useSensor } from '../context/SensorContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { getWBGTTier, getTierColors } from '../utils/wbgtLogic.js'
import { Thermometer } from 'lucide-react'

const TIERS = [
  { tierKey: 'SAFE',    range: '< 29.0°C',        workKey: 'safePct',    work: 100, rest: 0  },
  { tierKey: 'CAUTION', range: '29.0 – 31.0°C',   workKey: 'cautionPct', work: 75,  rest: 25 },
  { tierKey: 'WARNING', range: '31.0 – 32.5°C',   workKey: 'warningPct', work: 50,  rest: 50 },
  { tierKey: 'DANGER',  range: '> 32.5°C',         workKey: 'dangerPct',  work: 25,  rest: 75 },
]

export default function WorkRestAdvisory() {
  const { latestReading } = useSensor()
  const { t } = useLang()
  const tier = getWBGTTier(latestReading?.wbgt ?? 0)
  const colors = getTierColors(tier.tier)

  return (
    <div className="card p-5 h-full flex flex-col gap-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Thermometer className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          {t('workRestAdvisory')}
        </h2>
      </div>

      {/* Current reading highlight */}
      <div className={`rounded-lg p-3 border-l-4 ${colors.border} bg-slate-50 dark:bg-slate-700/50`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('currentStatus')}</p>
            <p className={`text-lg font-extrabold ${colors.text}`}>{t(tier.label)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">WBGT</p>
            <p className={`text-2xl font-extrabold tabular-nums ${colors.text}`}>
              {latestReading?.wbgt?.toFixed(1)}°C
            </p>
          </div>
        </div>
        {/* Work/Rest progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{t('work')} {tier.work}%</span>
            <span>{t('rest')} {tier.rest}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden flex">
            <div
              className={`h-full rounded-full transition-all duration-700 ${colors.bg}`}
              style={{ width: `${tier.work}%` }}
            />
          </div>
        </div>
      </div>

      {/* All tiers reference */}
      <div className="flex flex-col gap-2 flex-1">
        {TIERS.map((row) => {
          const c = getTierColors(row.tierKey)
          const isActive = row.tierKey === tier.tier
          return (
            <div
              key={row.tierKey}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all
                ${isActive
                  ? `border ${c.border} bg-slate-50 dark:bg-slate-700/60`
                  : 'opacity-50'}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.bg}`} />
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold ${c.text}`}>{t(row.label ?? row.tierKey.toLowerCase())}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">{row.range}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                {row.work}/{row.rest}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
