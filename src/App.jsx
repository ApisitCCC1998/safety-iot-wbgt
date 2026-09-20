import { ThemeProvider } from './context/ThemeContext.jsx'
import { LangProvider } from './context/LangContext.jsx'
import { SensorProvider } from './context/SensorContext.jsx'
import { HazardProvider } from './context/HazardContext.jsx'
import Header from './components/Header.jsx'
import MetricCard from './components/MetricCard.jsx'
import AlertBanner from './components/AlertBanner.jsx'
import WorkRestAdvisory from './components/WorkRestAdvisory.jsx'
import WBGTTrendChart from './components/WBGTTrendChart.jsx'
import IncidentDonutChart from './components/IncidentDonutChart.jsx'
import ThresholdStats from './components/ThresholdStats.jsx'
import HazardRegister from './components/HazardRegister.jsx'
import WeatherWidget from './components/WeatherWidget.jsx'
import { useSensor } from './context/SensorContext.jsx'
import { useLang } from './context/LangContext.jsx'
import { Thermometer, Droplets, Sun, Activity } from 'lucide-react'
import { DANGER_THRESHOLD } from './utils/wbgtLogic.js'

function Dashboard() {
  const { latestReading, isConnected } = useSensor()
  const { t } = useLang()
  const { temp, humidity, globeTemp, wbgt, timestamp, source } = latestReading

  const showDangerAlert = wbgt > DANGER_THRESHOLD

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Header />

      {/* Danger Alert Banner */}
      {showDangerAlert && <AlertBanner />}

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 1. Metric Cards Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label={t('wbgtIndex')}
            value={wbgt?.toFixed(1)}
            unit="°C"
            icon={<Activity className="w-5 h-5" />}
            variant="wbgt"
            wbgtValue={wbgt}
          />
          <MetricCard
            label={t('ambientTemp')}
            value={temp?.toFixed(1)}
            unit="°C"
            icon={<Thermometer className="w-5 h-5" />}
            variant="temp"
          />
          <MetricCard
            label={t('relativeHumidity')}
            value={humidity?.toFixed(1)}
            unit="%"
            icon={<Droplets className="w-5 h-5" />}
            variant="humidity"
          />
          <MetricCard
            label={t('globeTemp')}
            value={globeTemp?.toFixed(1)}
            unit="°C"
            icon={<Sun className="w-5 h-5" />}
            variant="globe"
          />
        </section>

        {/* 2. Charts + Advisory + Weather Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <WBGTTrendChart />
          </div>
          {/* Right sidebar: Weather Widget stacked above Work-Rest Advisory */}
          <div className="flex flex-col gap-4">
            <WeatherWidget />
            <WorkRestAdvisory />
          </div>
        </section>

        {/* 3. Analytics & Hazard Register Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ฝั่งซ้าย (col-span-1): สถิติกราฟโดนัท + สถิติการเกินเกณฑ์สะสม */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <IncidentDonutChart />
            <ThresholdStats />
          </div>

          {/* ฝั่งขวา (col-span-2): ตารางบันทึกความเสี่ยงและอุบัติการณ์ */}
          <div className="lg:col-span-2">
            <HazardRegister />
          </div>
        </section>

        {/* Footer status bar */}
        <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500 pb-4">
          <span>
            {t('lastUpdated')}: {timestamp ? new Date(timestamp).toLocaleTimeString() : '—'}
          </span>
          <span>
            {t('source')}: {source === 'esp32' ? t('esp32') : t('mock')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {isConnected ? t('connected') : t('disconnected')}
          </span>
        </footer>

      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <SensorProvider>
          <HazardProvider>
            <Dashboard />
          </HazardProvider>
        </SensorProvider>
      </LangProvider>
    </ThemeProvider>
  )
}