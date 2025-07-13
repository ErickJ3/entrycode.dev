export const queryKeys = {
  repos: {
    all: ['repos'] as const,
    byLanguage: (language: string) => ['repos', 'language', language] as const,
    search: (search: string) => ['repos', 'search', search] as const,
    filtered: (filters: { search?: string; language?: string }) =>
      ['repos', 'filtered', filters] as const,
  },
  languages: {
    all: ['languages'] as const,
    count: ['languages', 'count'] as const,
  },
  issues: {
    all: ['issues'] as const,
    byRepo: (repositoryId: string) => ['issues', 'repo', repositoryId] as const,
  },
} as const
