import { useState, useEffect, useCallback, useRef } from 'react'

const DEFAULT_COORDS = { lat: 13.7563, lon: 100.5018, label: 'Bangkok (default)' }

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const PARAMS = 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index'

export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [coords, setCoords] = useState(null)
  const [locationLabel, setLocationLabel] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Persist coords across re-fetches so refresh doesn't re-prompt location
  const coordsRef = useRef(null)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    const fetchWeather = async ({ lat, lon }) => {
      setLoading(true)
      setError(null)
      try {
        const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&current=${PARAMS}&timezone=auto`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Open-Meteo: HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) {
          setWeather(data.current)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch weather')
          setLoading(false)
        }
      }
    }

    // If we already resolved coords, just re-fetch weather (e.g. manual refresh)
    if (coordsRef.current) {
      fetchWeather(coordsRef.current)
      return () => { cancelled = true }
    }

    // First load — request geolocation
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return
          const c = { lat: pos.coords.latitude, lon: pos.coords.longitude }
          coordsRef.current = c
          setCoords(c)
          setLocationLabel('Your location')
          fetchWeather(c)
        },
        () => {
          // Denied / timed out — fall back to Bangkok
          if (cancelled) return
          coordsRef.current = DEFAULT_COORDS
          setCoords(DEFAULT_COORDS)
          setLocationLabel(DEFAULT_COORDS.label)
          fetchWeather(DEFAULT_COORDS)
        },
        { timeout: 6000, maximumAge: 300_000 }
      )
    } else {
      coordsRef.current = DEFAULT_COORDS
      setCoords(DEFAULT_COORDS)
      setLocationLabel(DEFAULT_COORDS.label)
      fetchWeather(DEFAULT_COORDS)
    }

    return () => { cancelled = true }
  }, [refreshKey])

  return { weather, loading, error, coords, locationLabel, refresh }
}
