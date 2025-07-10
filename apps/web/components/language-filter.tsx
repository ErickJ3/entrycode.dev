'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '~/components/ui/badge'
import { getLanguagesCount } from '~/lib/http/api'

export const LanguageFilter = () => {
  const { data: repoCounts } = useQuery({
    queryKey: ['languages-count-repo'],
    queryFn: getLanguagesCount,
  })

  if (!repoCounts) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Browse by Language
      </h2>

      <div className="flex flex-wrap gap-2 w-80">
        {repoCounts.map((item: { language: string; count: number }) => (
          <Badge
            key={item.language}
            variant="secondary"
            className="px-3 py-1 select-none text-sm font-medium transition-colors cursor-pointer border border-white/10"
          >
            {item.language} × {item.count}
          </Badge>
        ))}
      </div>
    </div>
  )
}
