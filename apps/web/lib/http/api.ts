import axios from 'axios'
import { LanguageCountResponse, RepositoryListResponse } from './types'

const client = axios.create({ baseURL: process.env.NEXT_PUBLIC_BACKEND_API })

export const getLanguagesCount = async () => {
  return client
    .get<LanguageCountResponse>('/repositories/languages/count')
    .then((resp) => resp.data.data)
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
