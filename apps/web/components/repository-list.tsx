'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { getAllRepos } from '~/lib/http/api'
import { queryKeys } from '~/lib/http/query-keys'

export const RepositoryList = ({ search = '' }) => {
  const observerRef = useRef<HTMLDivElement>(null)

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

  const formatLastActivity = (date: string) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffTime = Math.abs(now.getTime() - activityDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} days ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''} ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} year${years > 1 ? 's' : ''} ago`
    }
  }

  const allRepos = data?.pages.flatMap((page) => page.data) || []

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        All repos
      </h2>

      <div className="space-y-2 w-full">
        {allRepos.map((repo) => (
          <div key={repo.id} className="rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-400 font-medium"
              >
                {repo.fullName}
              </a>
              <span className="text-xs border px-2 py-1 rounded">
                {repo.issueCount} issues
              </span>
            </div>

            <p className="text-gray-300 text-sm mb-2">{repo.description}</p>

            <div className="text-sm">
              <span className="font-mono">
                lang:{' '}
                <span className="font-bold text-white/70">{repo.language}</span>
              </span>
              <span className="font-mono mx-4">
                stars:{' '}
                <span className="font-bold text-white/70">
                  {repo.stars.toLocaleString()}
                </span>
              </span>
              <span className="font-mono">
                last activity:{' '}
                <span className="font-bold text-white/70">
                  {formatLastActivity(repo.lastActivity)}
                </span>
              </span>
            </div>
          </div>
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
