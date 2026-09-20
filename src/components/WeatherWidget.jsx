import { useWeather } from '../hooks/useWeather.js'
import { useLang } from '../context/LangContext.jsx'
import {
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle,
  Wind, Thermometer, RefreshCw, MapPin, Loader2, WifiOff, Eye,
} from 'lucide-react'

// ── WMO Weather Code → Lucide icon + short label ─────────────────────────────
function getWeatherMeta(code) {
  if (code === 0)                                  return { Icon: Sun,            label: 'Clear Sky',       labelTh: 'ท้องฟ้าแจ่มใส',      color: 'text-amber-400'  }
  if (code <= 3)                                   return { Icon: Cloud,           label: 'Partly Cloudy',   labelTh: 'มีเมฆบางส่วน',        color: 'text-slate-400'  }
  if (code === 45 || code === 48)                  return { Icon: Cloud,           label: 'Foggy',           labelTh: 'หมอกหนา',             color: 'text-slate-400'  }
  if (code >= 51 && code <= 57)                    return { Icon: CloudDrizzle,    label: 'Drizzle',         labelTh: 'ฝนตกเล็กน้อย',        color: 'text-blue-400'   }
  if (code >= 61 && code <= 67)                    return { Icon: CloudRain,       label: 'Rain',            labelTh: 'ฝนตก',               color: 'text-blue-500'   }
  if (code >= 71 && code <= 77)                    return { Icon: CloudSnow,       label: 'Snow',            labelTh: 'หิมะตก',             color: 'text-sky-300'    }
  if (code >= 80 && code <= 82)                    return { Icon: CloudRain,       label: 'Rain Showers',    labelTh: 'ฝนชั่วคราว',          color: 'text-blue-500'   }
  if (code === 85 || code === 86)                  return { Icon: CloudSnow,       label: 'Snow Showers',    labelTh: 'หิมะชั่วคราว',        color: 'text-sky-300'    }
  if (code >= 95)                                  return { Icon: CloudLightning,  label: 'Thunderstorm',    labelTh: 'พายุฝนฟ้าคะนอง',      color: 'text-yellow-400' }
  return { Icon: Cloud, label: 'Unknown', labelTh: 'ไม่ทราบ', color: 'text-slate-400' }
}

// ── UV Index level ─────────────────────────────────────────────────────────────
function getUVLevel(uv) {
  if (uv <= 2)  return { level: 'Low',       levelTh: 'ต่ำ',          color: 'text-green-500'  }
  if (uv <= 5)  return { level: 'Moderate',  levelTh: 'ปานกลาง',      color: 'text-yellow-500' }
  if (uv <= 7)  return { level: 'High',      levelTh: 'สูง',          color: 'text-orange-500' }
  if (uv <= 10) return { level: 'Very High', levelTh: 'สูงมาก',       color: 'text-red-500'    }
  return          { level: 'Extreme',       levelTh: 'อันตรายมาก',    color: 'text-purple-500' }
}

// ── Loading skeleton ───────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
  )
}

export default function WeatherWidget() {
  const { weather, loading, error, locationLabel, refresh } = useWeather()
  const { lang, t } = useLang()

  const meta  = weather ? getWeatherMeta(weather.weather_code) : null
  const uvLvl = weather ? getUVLevel(weather.uv_index ?? 0) : null

  return (
    <div className="card p-5 flex flex-col gap-3 h-full">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider leading-none">
            {t('outdoorWeather')}
          </h2>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          aria-label={t('refreshWeather')}
          className="btn-ghost !px-2 !py-1.5 text-xs disabled:opacity-40"
          title={t('refreshWeather')}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Location label */}
      {locationLabel && (
        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 -mt-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{locationLabel}</span>
        </div>
      )}

      {/* ── Error State ─────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-3">
          <WifiOff className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">{t('weatherError')}</p>
          <button onClick={refresh} className="btn-ghost text-xs !px-3 !py-1">
            {t('retry')}
          </button>
        </div>
      )}

      {/* ── Loading State ────────────────────────────────────────────── */}
      {loading && !error && (
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </div>
      )}

      {/* ── Loaded State ─────────────────────────────────────────────── */}
      {weather && !loading && !error && meta && (
        <>
          {/* Main temp + condition */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-700/60 flex-shrink-0`}>
              <meta.Icon className={`w-7 h-7 ${meta.color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-end gap-1">
                <span className="text-3xl font-extrabold tabular-nums text-slate-700 dark:text-slate-100">
                  {weather.temperature_2m?.toFixed(1)}
                </span>
                <span className="text-base font-semibold text-slate-400 dark:text-slate-500 mb-0.5">°C</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {lang === 'th' ? meta.labelTh : meta.label}
              </p>
            </div>
          </div>

          {/* Sub-metrics grid */}
          <div className="grid grid-cols-3 gap-2">

            {/* Feels Like */}
            <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg p-2 flex flex-col items-center gap-1">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-slate-200">
                {weather.apparent_temperature?.toFixed(1)}°
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight">
                {t('feelsLike')}
              </span>
            </div>

            {/* Wind Speed */}
            <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg p-2 flex flex-col items-center gap-1">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-slate-200">
                {weather.wind_speed_10m?.toFixed(0)}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight">
                km/h
              </span>
            </div>

            {/* UV Index */}
            <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg p-2 flex flex-col items-center gap-1">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className={`text-sm font-bold tabular-nums ${uvLvl.color}`}>
                {weather.uv_index?.toFixed(1)}
              </span>
              <span className={`text-[10px] font-semibold ${uvLvl.color} text-center leading-tight`}>
                UV {lang === 'th' ? uvLvl.levelTh : uvLvl.level}
              </span>
            </div>

          </div>

          {/* Last updated timestamp */}
          {weather.time && (
            <p className="text-[10px] text-slate-300 dark:text-slate-600 text-right mt-auto">
              {t('lastUpdated')}: {new Date(weather.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </>
      )}
    </div>
  )
}
