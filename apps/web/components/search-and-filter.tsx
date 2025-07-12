'use client'

import { Search, X } from 'lucide-react'
import { Input } from '~/components/ui/input'
import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { useFilters } from '~/hooks/use-filters'

export function SearchAndFilters() {
  const { search, language, updateFilters } = useFilters()

  const handleSearchChange = (value: string) => {
    updateFilters({ search: value })
  }

  const clearLanguageFilter = () => {
    updateFilters({ language: '' })
  }

  return (
    <Card className="p-0 border-none py-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
          <Input
            placeholder="Search repositories by name, language or description..."
            className="pl-10 border-white/10 hover:border-white/20"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {language && (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="px-3 py-1 bg-blue-500/20 text-blue-300 border-blue-500/30"
            >
              {language}
              <X
                className="ml-2 h-3 w-3 cursor-pointer hover:text-blue-100"
                onClick={clearLanguageFilter}
              />
            </Badge>
          </div>
        )}
      </div>
    </Card>
  )
}
