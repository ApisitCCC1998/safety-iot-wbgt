import { useState } from 'react'
import { useLang } from '../context/LangContext.jsx'
import { getSeverityColors } from '../utils/wbgtLogic.js'
import { exportCSV } from '../utils/csvExport.js'
import ReportHazardModal from './ReportHazardModal.jsx'
import { ShieldAlert, Download, Plus, Clock, AlertTriangle } from 'lucide-react'

let idCounter = 9

const SEED_HAZARDS = [
  { id: 'HZ-001', timestamp: '2026-09-19 06:30', area: 'Rooftop Zone A',   category: 'Heat Stress',  severity: 'critical', status: 'open'       },
  { id: 'HZ-002', timestamp: '2026-09-18 14:15', area: 'Assembly Line B',  category: 'Ergonomic',    severity: 'medium',   status: 'inProgress' },
  { id: 'HZ-003', timestamp: '2026-09-18 09:00', area: 'Electrical Room',  category: 'Electrical',   severity: 'high',     status: 'open'       },
  { id: 'HZ-004', timestamp: '2026-09-17 11:45', area: 'Chemical Store',   category: 'Chemical',     severity: 'high',     status: 'inProgress' },
  { id: 'HZ-005', timestamp: '2026-09-17 07:30', area: 'Boiler Room',      category: 'Heat Stress',  severity: 'critical', status: 'open'       },
  { id: 'HZ-006', timestamp: '2026-09-16 13:20', area: 'Warehouse Floor',  category: 'Slip / Fall',  severity: 'medium',   status: 'closed'     },
  { id: 'HZ-007', timestamp: '2026-09-15 16:00', area: 'Loading Dock',     category: 'Ergonomic',    severity: 'low',      status: 'closed'     },
  { id: 'HZ-008', timestamp: '2026-09-14 08:45', area: 'Outdoor Yard',     category: 'Heat Stress',  severity: 'high',     status: 'inProgress' },
]

function StatusBadge({ status, t }) {
  const map = {
    open:       'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    inProgress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    closed:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  }
  const labelMap = { open: t('open'), inProgress: t('inProgress'), closed: t('closed') }
  return <span className={`badge ${map[status] ?? 'bg-gray-100 text-gray-800'}`}>{labelMap[status] ?? status}</span>
}

export default function HazardRegister() {
  const { t } = useLang()
  const [hazards, setHazards] = useState(SEED_HAZARDS)
  const [modalOpen, setModalOpen] = useState(false)

  const activeCount = hazards.filter((h) => h.status === 'open' || h.status === 'inProgress').length
  const daysLTI = 47 // static KPI

  const handleNewHazard = ({ area, category, severity, description }) => {
    const newRecord = {
      id: `HZ-${String(idCounter++).padStart(3, '0')}`,
      timestamp: new Date().toLocaleString('en-GB', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }).replace(',', ''),
      area,
      category: t(category),
      severity,
      status: 'open',
      description,
    }
    setHazards((prev) => [newRecord, ...prev])
  }

  const handleExport = () => {
    exportCSV(
      hazards.map((h) => ({
        ID: h.id,
        Timestamp: h.timestamp,
        Area: h.area,
        Category: h.category,
        Severity: h.severity,
        Status: h.status,
      })),
      'hazard-register.csv'
    )
  }

  return (
    <>
      <div className="card p-5 flex flex-col gap-4 h-full">

        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-green-600 dark:text-green-400 tabular-nums">{daysLTI}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{t('daysWithoutLTI')}</p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 tabular-nums">{activeCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{t('activeHazards')}</p>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              {t('hazardRegister')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="btn-ghost text-xs !px-3 !py-1.5">
              <Download className="w-3.5 h-3.5" />
              {t('exportCSV')}
            </button>
            <button onClick={() => setModalOpen(true)} className="btn-primary text-xs !px-3 !py-1.5">
              <Plus className="w-3.5 h-3.5" />
              {t('reportHazard')}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 -mx-1">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {[t('id'), t('timestamp'), t('area'), t('category'), t('severity'), t('status')].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {hazards.map((row, i) => (
                <tr
                  key={row.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors
                    ${i === 0 && row.id.startsWith('HZ-0') ? '' : ''}
                    ${row.status === 'open' ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}
                >
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.id}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.timestamp}</td>
                  <td className="px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200">{row.area}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300">{row.category}</td>
                  <td className="px-3 py-2.5">
                    <span className={`badge capitalize ${getSeverityColors(row.severity)}`}>{t(row.severity)}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={row.status} t={t} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReportHazardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleNewHazard}
      />
    </>
  )
}
