/**
 * Mock ESP32 sensor simulator
 * Generates realistic WBGT/temperature data using sine waves + noise
 */

let intervalId = null
let isRunning = false

// Baseline realistic values for a hot Thai industrial setting
const BASE = {
  temp: 34.5,      // °C ambient
  humidity: 72,    // %RH
  globeTemp: 38.0, // °C globe
  wbgt: 30.5,      // °C WBGT
}

function noise(amplitude) {
  return (Math.random() - 0.5) * 2 * amplitude
}

function generateReading(tick) {
  const t = tick * 0.08
  // Slow diurnal cycle on WBGT + random noise
  const wbgt = parseFloat(
    (BASE.wbgt + Math.sin(t) * 2.8 + noise(0.4)).toFixed(2)
  )
  const temp = parseFloat(
    (BASE.temp + Math.sin(t + 0.3) * 2.0 + noise(0.3)).toFixed(2)
  )
  const humidity = parseFloat(
    Math.max(40, Math.min(95, BASE.humidity + Math.cos(t * 0.7) * 8 + noise(2))).toFixed(1)
  )
  const globeTemp = parseFloat(
    (BASE.globeTemp + Math.sin(t + 0.1) * 3.0 + noise(0.5)).toFixed(2)
  )
  return { temp, humidity, globeTemp, wbgt, timestamp: new Date().toISOString() }
}

/**
 * Start the mock simulator
 * @param {Function} broadcastFn - called with each generated reading
 * @param {number} intervalMs - interval between readings (default 2000ms)
 */
export function startSimulator(broadcastFn, intervalMs = 2000) {
  if (isRunning) return
  let tick = Math.floor(Math.random() * 100) // random start phase
  isRunning = true
  intervalId = setInterval(() => {
    tick++
    const reading = generateReading(tick)
    broadcastFn(reading)
  }, intervalMs)
  console.log('[Simulator] Mock sensor stream STARTED')
}

export function stopSimulator() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  isRunning = false
  console.log('[Simulator] Mock sensor stream STOPPED')
}

export function isSimulatorRunning() {
  return isRunning
}
