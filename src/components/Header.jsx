import { useTheme } from '../context/ThemeContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { useSensor } from '../context/SensorContext.jsx'
import { Sun, Moon, Wifi, WifiOff, ShieldCheck } from 'lucide-react'

export default function Header() {
  const { isDark, toggle: toggleTheme } = useTheme()
  const { lang, toggle: toggleLang, t } = useLang()
  const { isDeviceActive } = useSensor() // ใช้สถานะของบอร์ดฮาร์ดแวร์จริง

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-amber-500 to-red-600 rounded-lg flex items-center justify-center shadow">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                {t('appTitle')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* ESP32 Hardware Status Badge (Online เฉพาะตอนส่งข้อมูลจริงเข้ามา) */}
            <div
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
                isDeviceActive
                  ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm shadow-emerald-500/10'
                  : 'border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 shadow-sm shadow-rose-500/10'
              }`}
            >
              {isDeviceActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Wifi className="w-3.5 h-3.5" />
                  <span>ESP32: Online</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>ESP32: Offline</span>
                </>
              )}
            </div>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              aria-label="Toggle language"
              className="btn-ghost h-9 w-16 text-xs font-bold tracking-wider"
            >
              {lang === 'en' ? '🇹🇭 TH' : '🇺🇸 EN'}
            </button>

            {/* Dark/Light toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? t('lightMode') : t('darkMode')}
              className="btn-ghost h-9 w-9 !px-0 justify-center"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}