import { useEffect, useRef } from 'react'
import { useLang } from '../context/LangContext.jsx'
import { getSeverityColors } from '../utils/wbgtLogic.js'
import { X } from 'lucide-react'

const CATEGORIES = ['heatStress', 'slipFall', 'chemical', 'electrical', 'ergonomic']
const SEVERITIES = ['critical', 'high', 'medium', 'low']

export default function ReportHazardModal({ isOpen, onClose, onSubmit }) {
  const { t } = useLang()
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  // Close on backdrop click
  const handleDialogClick = (e) => {
    const rect = dialogRef.current?.getBoundingClientRect()
    if (rect && (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom
    )) {
      onClose()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    onSubmit({
      area: fd.get('area'),
      category: fd.get('category'),
      severity: fd.get('severity'),
      description: fd.get('description'),
    })
    e.target.reset()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onClose={onClose}
      className="
        w-full max-w-lg rounded-xl shadow-2xl p-0
        bg-white dark:bg-slate-800
        text-slate-800 dark:text-slate-100
        backdrop:bg-black/50 backdrop:backdrop-blur-sm
        open:animate-fade-in
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{t('modalTitle')}</h3>
        <button
          type="button"
          onClick={onClose}
          className="btn-ghost !px-2 !py-2 rounded-lg"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        {/* Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="area">
            {t('modalArea')} <span className="text-red-500">*</span>
          </label>
          <input
            id="area"
            name="area"
            type="text"
            required
            placeholder={t('modalAreaPlaceholder')}
            className="
              w-full px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-700
              text-slate-800 dark:text-slate-100
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
            "
          />
        </div>

        {/* Category + Severity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="category">
              {t('modalCategory')} <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue=""
              className="
                w-full px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              <option value="" disabled>— Select —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(c)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="severity">
              {t('modalSeverity')} <span className="text-red-500">*</span>
            </label>
            <select
              id="severity"
              name="severity"
              required
              defaultValue=""
              className="
                w-full px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              <option value="" disabled>— Select —</option>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{t(s)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="description">
            {t('modalDescription')}
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder={t('modalDescPlaceholder')}
            className="
              w-full px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-blue-500
              resize-none
            "
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            {t('cancel')}
          </button>
          <button type="submit" className="btn-primary">
            {t('submit')}
          </button>
        </div>
      </form>
    </dialog>
  )
}
