'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getAllRepos } from '~/lib/http/api'
import { queryKeys } from '~/lib/http/query-keys'
import { formatLastActivity } from '~/lib/utils'
import { RepositoryCard } from './repository-card'

export const RepositoryList = ({ search = '' }: { search?: string }) => {
  const observerRef = useRef<HTMLDivElement>(null)
  const [expandedRepoId, setExpandedRepoId] = useState<string | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [queryKeys.languages.all, search],
      queryFn: ({ pageParam = 1 }) => getAllRepos(pageParam, 10, search),
      getNextPageParam: (lastPage) => {
        const { pagination } = lastPage
        return pagination.hasNextPage ? pagination.page + 1 : undefined
      },
      initialPageParam: 1,
    })

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  )

  useEffect(() => {
    const element = observerRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [handleObserver])

  const toggleRepoExpansion = (repoId: string) => {
    setExpandedRepoId((prevId) => (prevId === repoId ? null : repoId))
  }

  const allRepos = data?.pages.flatMap((page) => page.items) || []

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        All repos
      </h2>

      <div className="space-y-2 w-full">
        {allRepos.map((repo) => (
          <RepositoryCard
            key={repo.id}
            repo={repo}
            isExpanded={expandedRepoId === repo.id}
            onToggle={() => toggleRepoExpansion(repo.id)}
            formatLastActivity={formatLastActivity}
          />
        ))}

        <div ref={observerRef} className="h-4" />

        {isFetchingNextPage && (
          <div className="text-center py-4">
            <Loader2 className="animate-spin" size={24} />
          </div>
        )}

        {!hasNextPage && allRepos.length > 0 && (
          <div className="text-center py-4">
            <div className="text-sm text-gray-400">
              All repositories have been loaded
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
