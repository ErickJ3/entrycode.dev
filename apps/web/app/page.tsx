import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { RepositoryList } from '~/components/repository-list'
import { RepositoryLayout } from '~/components/repository-layout'
import { getAllRepos, getLanguagesCount } from '~/lib/http/api'
import { getQueryClient } from '~/lib/query-client'
import { queryKeys } from '~/lib/http/query-keys'

export default async function Home() {
  const queryClient = getQueryClient()

  await Promise.all([
    queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.repos.all,
      queryFn: ({ pageParam = 1 }) => getAllRepos(pageParam, 10),
      initialPageParam: 1,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.languages.count,
      queryFn: getLanguagesCount,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RepositoryLayout>
        <RepositoryList />
      </RepositoryLayout>
    </HydrationBoundary>
  )
}
