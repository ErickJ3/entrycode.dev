interface LanguageCount {
  language: string
  count: number
}

export interface LanguageCountResponse {
  items: LanguageCount[]
  total: number
}

export interface Repository {
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
  items: Repository[]
  pagination: PaginationInfo
}

export interface Issue {
  id: string
  githubId: number
  title: string
  comments: number
}

export interface Pagination {
  total: number
  limit: number
  offset: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface IssueListResponse {
  items: Issue[]
  pagination: Pagination
}
