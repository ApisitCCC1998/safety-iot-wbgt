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
// ✅ เพิ่ม Waves สำหรับ Tnw Card
import { Thermometer, Droplets, Sun, Activity, Waves } from 'lucide-react'
import { DANGER_THRESHOLD } from './utils/wbgtLogic.js'

function Dashboard() {
  const { latestReading, isConnected } = useSensor()
  const { t } = useLang()

  // ✅ เพิ่ม wetBulb ใน destructure
  const { temp, humidity, globeTemp, wetBulb, wbgt, timestamp } = latestReading

  const showDangerAlert = wbgt > DANGER_THRESHOLD

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Header />

      {showDangerAlert && <AlertBanner />}

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 1. Metric Cards Row — ✅ เพิ่มเป็น 5 Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">

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

          {/* ✅ Tnw Card ใหม่ — Natural Wet Bulb Temperature */}
          <MetricCard
            label="Wet Bulb Temp"
            value={wetBulb != null ? wetBulb?.toFixed(1) : '—'}
            unit="°C"
            icon={<Waves className="w-5 h-5" />}
            variant="wetbulb"
            subtitle="น้ำหนัก 70% ในสูตร WBGT"
          />

        </section>

        {/* 2. Charts + Advisory + Weather Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <WBGTTrendChart />
          </div>
          <div className="flex flex-col gap-4">
            <WeatherWidget />
            <WorkRestAdvisory />
          </div>
        </section>

        {/* 3. Analytics & Hazard Register Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <IncidentDonutChart />
            <ThresholdStats />
          </div>
          <div className="lg:col-span-2">
            <HazardRegister />
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500 pb-4">
          <span>
            {t('lastUpdated')}: {timestamp ? new Date(timestamp).toLocaleTimeString() : '—'}
          </span>
          <span>
            {t('source')}: <span className="font-semibold text-slate-600 dark:text-slate-300">WBGT ESP32</span>
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