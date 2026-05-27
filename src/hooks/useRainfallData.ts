import { useQuery, useQueryClient } from '@tanstack/react-query'
import { parseSheetCsv } from '@/lib/sheetParser'
import type { RainfallRecord } from '@/types/rainfall'

const SHEET_CSV_URL = import.meta.env.VITE_SHEET_CSV_URL as string

async function fetchRainfallData(): Promise<RainfallRecord[]> {
  const res = await fetch(SHEET_CSV_URL)
  if (!res.ok) throw new Error('Failed to fetch rainfall data')
  const csv = await res.text()
  return parseSheetCsv(csv)
}

export function useRainfallData() {
  return useQuery({
    queryKey: ['rainfall'],
    queryFn: fetchRainfallData,
    staleTime: Infinity, // manual refresh only
    enabled: !!SHEET_CSV_URL,
  })
}

export function useRefreshRainfall() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['rainfall'] })
}
