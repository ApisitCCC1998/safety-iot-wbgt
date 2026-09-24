import { getWBGTTier, getTierColors } from '../utils/wbgtLogic.js'

// ✅ เพิ่ม wetbulb variant สำหรับ Tnw Card
const variantStyles = {
  temp:     { accent: 'text-blue-500',   iconBg: 'bg-blue-100 dark:bg-blue-900/30'   },
  humidity: { accent: 'text-cyan-500',   iconBg: 'bg-cyan-100 dark:bg-cyan-900/30'   },
  globe:    { accent: 'text-orange-500', iconBg: 'bg-orange-100 dark:bg-orange-900/30' },
  wetbulb:  { accent: 'text-teal-500',  iconBg: 'bg-teal-100 dark:bg-teal-900/30'   },
}

export default function MetricCard({ label, value, unit, icon, variant, wbgtValue, subtitle }) {
  const isWbgt = variant === 'wbgt'
  const tier   = isWbgt ? getWBGTTier(wbgtValue ?? 0) : null
  const colors = isWbgt ? getTierColors(tier.tier) : null

  const accentText = isWbgt
    ? colors.text
    : variantStyles[variant]?.accent ?? 'text-slate-600'
  const iconBg = isWbgt
    ? ''
    : variantStyles[variant]?.iconBg ?? ''

  return (
    <div className={`card p-5 flex flex-col gap-3 transition-all duration-300
      ${isWbgt ? `border-l-4 ${colors.border}` : ''}`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center
          ${isWbgt ? `${colors.bg} bg-opacity-20` : iconBg}`}>
          <span className={accentText}>{icon}</span>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end gap-1">
        <span className={`text-3xl font-extrabold tabular-nums ${accentText}`}>
          {value ?? '—'}
        </span>
        <span className="text-base font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
          {unit}
        </span>
      </div>

      {/* WBGT tier badge */}
      {isWbgt && tier && (
        <div className="flex items-center gap-2">
          <span className={`badge ${colors.badge}`}>{tier.tier}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Work {tier.work}% / Rest {tier.rest}%
          </span>
        </div>
      )}

      {/* ✅ subtitle สำหรับ wetbulb — แสดงน้ำหนักในสูตร WBGT */}
      {variant === 'wetbulb' && (
        <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
          {subtitle ?? 'น้ำหนัก 70% ในสูตร WBGT'}
        </p>
      )}
    </div>
  )
}
