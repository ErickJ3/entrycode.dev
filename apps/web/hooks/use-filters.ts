'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export const useFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const search = searchParams.get('search') || ''
  const language = searchParams.get('language') || ''

  const updateFilters = useCallback(
    (filter: { search?: string; language?: string }) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value) {
            params.set(key, value)
          } else {
            params.delete(key)
          }
        }
      })

      params.delete('page')
      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  return {
    search,
    language,
    updateFilters,
  }
}
