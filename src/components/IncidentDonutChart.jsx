import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useLang } from '../context/LangContext.jsx'
import { PieChart as PieChartIcon } from 'lucide-react'

const INCIDENT_DATA = [
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

  const data = INCIDENT_DATA.map((d) => ({ ...d, name: t(d.key) }))
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="card p-5 h-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <PieChartIcon className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          {t('incidentBreakdown')}
        </h2>
      </div>

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

      <div className="text-center text-xs text-slate-400 dark:text-slate-500">
        Total: <span className="font-bold text-slate-600 dark:text-slate-300">{total}</span> incidents recorded
      </div>
    </div>
  )
}
