import { AlertTriangle } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'
import { useSensor } from '../context/SensorContext.jsx'

export default function AlertBanner() {
  const { t } = useLang()
  const { latestReading } = useSensor()

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="animate-slide-down bg-red-600 dark:bg-red-700 text-white"
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse-fast" />
          <p className="text-sm font-semibold flex-1">
            {t('dangerAlert')}
          </p>
          <span className="text-xs font-mono bg-red-800 dark:bg-red-900 px-2 py-0.5 rounded whitespace-nowrap">
            WBGT {latestReading?.wbgt?.toFixed(1)}°C
          </span>
        </div>
      </div>
    </div>
  )
}
