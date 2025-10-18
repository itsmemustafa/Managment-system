import React from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

function toCsvValue(val) {
  if (val == null) return ''
  const s = String(val)
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function buildCsv(data = [], columns) {
  const rows = Array.isArray(data) ? data : []
  if (rows.length === 0) return ''

  const cols = columns && columns.length
    ? columns
    : Object.keys(rows[0]).map(k => ({ key: k, label: k }))

  const header = cols.map(c => toCsvValue(c.label ?? c.key)).join(',')
  const lines = rows.map(r => cols.map(c => toCsvValue(r[c.key])).join(','))
  return [header, ...lines].join('\n')
}

export default function ExportCSV({ data, fileName = 'export.csv', columns }) {
  const onExport = () => {
    try {
      const csv = buildCsv(data, columns)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('CSV export failed', e)
      alert('Failed to export CSV')
    }
  }

  return (
    <Button type="button" variant="outline" className="gap-2" onClick={onExport}>
      <Download size={16} /> Export CSV
    </Button>
  )
}