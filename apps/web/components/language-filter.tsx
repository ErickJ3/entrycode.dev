'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Badge } from '~/components/ui/badge'
import { getLanguagesCount } from '~/lib/http/api'
import { queryKeys } from '~/lib/http/query-keys'

export const LanguageFilter = () => {
  const router = useRouter()
  const { data: repoCounts } = useQuery({
    queryKey: [queryKeys.languages.count],
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
            onClick={() => router.push(`/${item.language.toLowerCase()}`)}
          >
            {item.language} × {item.count}
          </Badge>
        ))}
      </div>
    </div>
  )
}
