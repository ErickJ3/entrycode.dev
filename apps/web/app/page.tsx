import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { LanguageFilter } from '~/components/language-filter'
import { RepositoryList } from '~/components/repository-list'
import { SearchAndFilters } from '~/components/search-and-filter'
import { getAllRepos, getLanguagesCount } from '~/lib/http/api'
import { getQueryClient } from '~/lib/query-client'

export default async function Home() {
  const queryClient = getQueryClient()

  await Promise.all([
    queryClient.prefetchInfiniteQuery({
      queryKey: ['repos'],
      queryFn: ({ pageParam = 1 }) => getAllRepos(pageParam, 10),
      initialPageParam: 1,
    }),
    queryClient.prefetchQuery({
      queryKey: ['languages-count-repo'],
      queryFn: getLanguagesCount,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-gradient-to-br">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <LanguageFilter />
              </div>
            </div>
            <div className="lg:col-span-3 space-y-6">
              <SearchAndFilters />
              <RepositoryList />
            </div>
          </div>
        </div>
      </div>
    </HydrationBoundary>
  )
}
