import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { RepositoryLayout } from '~/components/repository-layout'
import { RepositoryList } from '~/components/repository-list'
import { getAllRepos, getLanguagesCount } from '~/lib/http/api'
import { queryKeys } from '~/lib/http/query-keys'
import { getQueryClient } from '~/lib/query-client'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function LanguagePage({ params }: PageProps) {
  const { slug } = await params
  const language = decodeURIComponent(slug)
  const queryClient = getQueryClient()

  try {
    await Promise.all([
      queryClient.prefetchInfiniteQuery({
        queryKey: queryKeys.repos.byLanguage(language),
        queryFn: ({ pageParam = 1 }) => getAllRepos(pageParam, 10, language),
        initialPageParam: 1,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.languages.count,
        queryFn: getLanguagesCount,
      }),
    ])
  } catch {
    notFound()
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RepositoryLayout>
        <RepositoryList search={language} />
      </RepositoryLayout>
    </HydrationBoundary>
  )
}
