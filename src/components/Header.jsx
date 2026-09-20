import { useTheme } from '../context/ThemeContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { useSensor } from '../context/SensorContext.jsx'
import { Sun, Moon, Play, Pause, Wifi, WifiOff, ShieldCheck } from 'lucide-react'

export default function Header() {
  const { isDark, toggle: toggleTheme } = useTheme()
  const { lang, toggle: toggleLang, t } = useLang()
  const { isConnected, isStreaming, toggleStream } = useSensor()

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

            {/* WS Connection indicator */}
            <div className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border
              ${isConnected
                ? 'border-green-400 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                : 'border-red-400 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20'}`}
            >
              {isConnected
                ? <Wifi className="w-3.5 h-3.5" />
                : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isConnected ? t('connected') : t('disconnected')}</span>
            </div>

            {/* Play/Pause Stream */}
            <button
              onClick={toggleStream}
              aria-label={isStreaming ? t('pauseStream') : t('playStream')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                ${isStreaming
                  ? 'bg-amber-50 border-amber-400 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-500 dark:hover:bg-amber-900/30'
                  : 'bg-green-50 border-green-400 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-500 dark:hover:bg-green-900/30'}`}
            >
              {isStreaming
                ? <><Pause className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t('pauseStream')}</span></>
                : <><Play  className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t('playStream')}</span></>}
            </button>

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
