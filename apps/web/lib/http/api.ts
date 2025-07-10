import axios from 'axios'
import { LanguageCountResponse, RepositoryListResponse } from './types'

const client = axios.create({ baseURL: 'http://localhost:3333' })

export const getLanguagesCount = async () => {
  return client
    .get<LanguageCountResponse>('/repositories/languages/count')
    .then((resp) => resp.data.data)
}

export const getAllRepos = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  return client
    .get<RepositoryListResponse>('/repositories', {
      params: { limit, offset },
    })
    .then((resp) => resp.data)
}
