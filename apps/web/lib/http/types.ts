interface LanguageCount {
  language: string
  count: number
}

export interface LanguageCountResponse {
  data: LanguageCount[]
  total: number
}

interface Repository {
  id: string
  name: string
  fullName: string
  description: string
  language: string
  stars: number
  url: string
  owner: string
  repo: string
  labels: string[]
  lastActivity: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  issueCount: number
}

interface PaginationInfo {
  total: number
  limit: number
  offset: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface RepositoryListResponse {
  data: Repository[]
  pagination: PaginationInfo
}
