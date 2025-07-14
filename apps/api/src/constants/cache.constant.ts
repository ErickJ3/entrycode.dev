export enum CacheKey {
  GithubRateLimit = 'github:rate-limit:%s',
  GithubRequestCount = 'github:requests:%s:%s',
  GithubLastRequest = 'github:last-request:%s',
  RepositoriesList = 'repositories:list:%s',
  RepositoryIssues = 'repository:issues:%s:%s',
  LanguagesCount = 'languages:count',
  IssuesList = 'issues:list:%s',
}