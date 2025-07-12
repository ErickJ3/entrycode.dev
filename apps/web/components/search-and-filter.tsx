'use client'

import { Search } from 'lucide-react'
import { Input } from '~/components/ui/input'
import { Card } from '~/components/ui/card'

export function SearchAndFilters() {
  return (
    <Card className="p-0 border-none py-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
          <Input
            placeholder="Search repositories by name, language or description..."
            className="pl-10 border-white/10 hover:border-white/20"
          />
        </div>
      </div>
    </Card>
  )
}
