import { useCallback } from 'react'
import { exportToCSV, exportToJSON, printData } from '@/lib/export-utils'

export function useExport() {
  const exportCSV = useCallback((data: any[], filename: string) => {
    exportToCSV(data, filename)
  }, [])

  const exportJSON = useCallback((data: any[], filename: string) => {
    exportToJSON(data, filename)
  }, [])

  const print = useCallback((data: any[], title: string) => {
    printData(data, title)
  }, [])

  return {
    exportCSV,
    exportJSON,
    print
  }
}