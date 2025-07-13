import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { getRepoIssues } from '~/lib/http/api'
import { queryKeys } from '~/lib/http/query-keys'
import { Repository } from '~/lib/http/types'

interface RepositoryCardProps {
  repo: Repository
  isExpanded: boolean
  onToggle: () => void
  formatLastActivity: (date: string) => string
}

export const RepositoryCard = ({
  repo,
  isExpanded,
  onToggle,
  formatLastActivity,
}: RepositoryCardProps) => {
  const { data: issues, isLoading: isLoadingIssues } = useQuery({
    queryKey: [queryKeys.issues.byRepo, repo.id],
    queryFn: () => getRepoIssues(repo.id),
    enabled: isExpanded,
  })

  return (
    <div className="rounded-lg border border-white/10 hover:border-white transition-colors">
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between mb-2">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {repo.fullName}
          </a>
          <div className="flex items-center gap-2">
            <span className="text-xs border px-2 py-1 rounded">
              {repo.issueCount} issues
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
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

      {isExpanded && (
        <div className="border-t border-white/10 p-4 bg-white/1">
          <h3 className="text-sm font-medium text-white mb-3">Issues</h3>

          {isLoadingIssues ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="animate-spin w-4 h-4" />
              <span className="ml-2 text-sm text-gray-400">
                Loading issues...
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {(issues?.items?.length || 0) > 0 ? (
                issues?.items?.map((issue) => (
                  <a
                    href={`${repo.url}/issues/${issue.githubId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={issue.id}
                    className="block p-3 rounded border border-white/5 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm text-white font-medium">
                        {issue.title}
                      </h4>
                      <span className="text-xs text-gray-400 ml-2">
                        {issue.comments} comments
                      </span>
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No issues found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
