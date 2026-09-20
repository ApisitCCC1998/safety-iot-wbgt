/**
 * WBGT Heat Stress Advisory Logic — ACGIH TLV Guidelines
 */

export const WBGT_THRESHOLDS = {
  SAFE:    { max: 29.0, label: 'safe',    work: 100, rest: 0  },
  CAUTION: { max: 31.0, label: 'caution', work: 75,  rest: 25 },
  WARNING: { max: 32.5, label: 'warning', work: 50,  rest: 50 },
  DANGER:  { max: Infinity, label: 'danger', work: 25, rest: 75 },
}

export const DANGER_THRESHOLD = 32.5  // Alert banner trigger
export const CHART_REF_LINE   = 30.0  // Reference line on trend chart

/**
 * Returns the ACGIH tier object for a given WBGT value
 */
export function getWBGTTier(wbgt) {
  if (wbgt < WBGT_THRESHOLDS.SAFE.max)    return { ...WBGT_THRESHOLDS.SAFE,    tier: 'SAFE'    }
  if (wbgt < WBGT_THRESHOLDS.CAUTION.max) return { ...WBGT_THRESHOLDS.CAUTION, tier: 'CAUTION' }
  if (wbgt < WBGT_THRESHOLDS.WARNING.max) return { ...WBGT_THRESHOLDS.WARNING, tier: 'WARNING' }
  return { ...WBGT_THRESHOLDS.DANGER, tier: 'DANGER' }
}

/**
 * Returns Tailwind color classes for each tier
 */
export function getTierColors(tier) {
  switch (tier) {
    case 'SAFE':    return { bg: 'bg-green-500',  border: 'border-green-500',  text: 'text-green-500',  badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
    case 'CAUTION': return { bg: 'bg-yellow-400', border: 'border-yellow-400', text: 'text-yellow-400', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' }
    case 'WARNING': return { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-500', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' }
    case 'DANGER':  return { bg: 'bg-red-500',    border: 'border-red-500',    text: 'text-red-500',    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
    default:        return { bg: 'bg-gray-400',   border: 'border-gray-400',   text: 'text-gray-400',   badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
  }
}

export function getSeverityColors(severity) {
  switch (severity?.toLowerCase()) {
    case 'critical':  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'high':      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'medium':    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'low':       return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    default:          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}
