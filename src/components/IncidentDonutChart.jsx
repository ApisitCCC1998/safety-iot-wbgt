import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useLang } from '../context/LangContext.jsx'
import { useHazard } from '../context/HazardContext.jsx'
import { PieChart as PieChartIcon, CheckCircle2 } from 'lucide-react'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold">{name}</p>
      <p className="text-slate-500 dark:text-slate-400">{value} รายการ</p>
    </div>
  )
}

const CustomLegend = ({ payload }) => (
  <div className="flex flex-col gap-1.5 mt-2">
    {payload?.map((entry) => (
      <div key={entry.value} className="flex items-center gap-2 text-xs">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
        <span className="text-slate-600 dark:text-slate-300 flex-1 truncate">{entry.value}</span>
        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{entry.payload?.value}</span>
      </div>
    ))}
  </div>
)

export default function IncidentDonutChart() {
  const { t } = useLang()
  const { categoryStats, totalIncidents } = useHazard()

  // มีข้อมูลรายการที่ count > 0 หรือไม่
  const hasActiveIncidents = totalIncidents > 0

  return (
    <div className="card p-5 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {t('incidentBreakdown')}
          </h2>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-medium text-slate-500">
          Sync Live
        </span>
      </div>

      <div className="flex-1 min-h-[200px]">
        {!hasActiveIncidents ? (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-xs text-slate-400 dark:text-slate-500 gap-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            <p className="font-bold text-slate-700 dark:text-slate-300">ไม่มีอุบัติการณ์ค้างในระบบ</p>
            <p className="text-[11px] text-slate-400">กราฟจะแสดงสัดส่วนอัตโนมัติเมื่อมีรายการในตาราง</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryStats}
                cx="50%"
                cy="45%"
                innerRadius="48%"
                outerRadius="68%"
                paddingAngle={3}
                dataKey="value"
              >
                {categoryStats.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} layout="vertical" align="center" verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="text-center text-xs text-slate-400 dark:text-slate-500">
        รวมทั้งหมด: <span className="font-bold text-slate-700 dark:text-slate-200">{totalIncidents}</span> รายการ
      </div>
    </div>
  )
}