import axios from 'axios'
import {
  IssueListResponse,
  LanguageCountResponse,
  RepositoryListResponse,
} from './types'

const client = axios.create({ baseURL: process.env.NEXT_PUBLIC_BACKEND_API })

export const getLanguagesCount = async () => {
  return client
    .get<LanguageCountResponse>('/repositories/languages/count')
    .then((resp) => resp.data.items)
}

export const getAllRepos = async (page = 1, limit = 10, search?: string) => {
  const offset = (page - 1) * limit

  return client
    .get<RepositoryListResponse>('/repositories', {
      params: {
        limit,
        offset,
        ...(search && { search }),
      },
    })
    .then((resp) => resp.data)
}

export const getRepoIssues = async (
  repositoryId: string,
  page = 1,
  limit = 10,
  search?: string,
) => {
  const offset = (page - 1) * limit

  return client
    .get<IssueListResponse>(`/repositories/${repositoryId}/issues`, {
      params: {
        limit,
        offset,
        ...(search && { search }),
      },
    })
    .then((resp) => resp.data)
}
