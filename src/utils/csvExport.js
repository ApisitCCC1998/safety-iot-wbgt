/**
 * CSV export utility for hazard register
 */

function escapeCSV(value) {
  const str = String(value ?? '')
  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Export an array of objects as a CSV download
 * @param {Object[]} data - array of row objects
 * @param {string} filename - desired file name
 */
export function exportCSV(data, filename = 'hazard-register.csv') {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.map(escapeCSV).join(','),
    ...data.map((row) => headers.map((h) => escapeCSV(row[h])).join(',')),
  ]

  const csvString = csvRows.join('\r\n')
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
