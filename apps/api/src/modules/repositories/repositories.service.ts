import { count, sql, asc, desc, and, ilike, SQL, eq } from 'drizzle-orm'
import { Injectable } from '@nestjs/common'
import { issuesTable, repositoriesTable } from '~/database/schema'
import { db } from '~/database/client'

interface PaginationOptions<T extends string = string> {
  limit?: number
  offset?: number
  search?: string
  sortBy?: T
  sortOrder?: 'asc' | 'desc'
}

interface RepositoryPaginationOptions
  extends PaginationOptions<'stars' | 'lastActivity' | 'createdAt' | 'name'> {}

interface IssuesPaginationOptions
  extends PaginationOptions<
    | 'createdAt'
    | 'updatedAt'
    | 'githubCreatedAt'
    | 'githubUpdatedAt'
    | 'comments'
    | 'number'
  > {
  state?: 'open' | 'closed'
  isGoodFirstIssue?: boolean
  repositoryId?: string
}

@Injectable()
export class RepositoriesService {
  async listAllRepositories(options: RepositoryPaginationOptions = {}) {
    const {
      limit = 10,
      offset = 0,
      search,
      sortBy = 'stars',
      sortOrder = 'desc',
    } = options

    const conditions: NonNullable<SQL<unknown>>[] = []

    if (search) {
      conditions.push(ilike(repositoriesTable.language, `%${search}%`))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const baseQuery = db
      .select({
        id: repositoriesTable.id,
        name: repositoriesTable.name,
        fullName: repositoriesTable.fullName,
        description: repositoriesTable.description,
        language: repositoriesTable.language,
        stars: repositoriesTable.stars,
        url: repositoriesTable.url,
        owner: repositoriesTable.owner,
        repo: repositoriesTable.repo,
        labels: repositoriesTable.labels,
        lastActivity: repositoriesTable.lastActivity,
        isActive: repositoriesTable.isActive,
        createdAt: repositoriesTable.createdAt,
        updatedAt: repositoriesTable.updatedAt,
        issueCount: count(issuesTable.id).as('issueCount'),
      })
      .from(repositoriesTable)
      .leftJoin(
        issuesTable,
        sql`${repositoriesTable.id} = ${issuesTable.repositoryId}`,
      )
      .where(whereClause)
      .groupBy(repositoriesTable.id)

    const orderByColumn = this.getOrderByColumn(sortBy)
    const orderDirection = sortOrder === 'asc' ? asc : desc

    const query = baseQuery
      .orderBy(orderDirection(orderByColumn))
      .limit(limit)
      .offset(offset)

    const repositories = await query

    const countQuery = db
      .select({ count: count() })
      .from(repositoriesTable)
      .where(whereClause)

    const [{ count: totalCount }] = await countQuery

    return {
      items: repositories,
      pagination: {
        total: totalCount,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: offset + repositories.length < totalCount,
        hasPreviousPage: offset > 0,
      },
    }
  }

  async getRepositoriesCountByLanguage() {
    const result = await db
      .select({
        language: repositoriesTable.language,
        count: count(),
      })
      .from(repositoriesTable)
      .where(
        sql`${repositoriesTable.language} IS NOT NULL AND ${repositoriesTable.language} != ''`,
      )
      .groupBy(repositoriesTable.language)
      .orderBy(sql`count(*) DESC`)

    return result as { language: string; count: number }[]
  }

  async listAllIssues(options: IssuesPaginationOptions = {}) {
    const {
      limit = 10,
      offset = 0,
      search,
      sortBy = 'githubCreatedAt',
      sortOrder = 'desc',
      state,
      repositoryId,
    } = options

    const conditions: NonNullable<SQL<unknown>>[] = []

    if (search) {
      conditions.push(ilike(issuesTable.title, `%${search}%`))
    }

    if (state) {
      conditions.push(eq(issuesTable.state, state))
    }

    if (repositoryId) {
      conditions.push(eq(issuesTable.repositoryId, repositoryId))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const baseQuery = db
      .select({
        id: issuesTable.id,
        githubId: issuesTable.number,
        title: issuesTable.title,
        comments: issuesTable.comments,
      })
      .from(issuesTable)
      .where(whereClause)

    const orderByColumn = this.getIssuesOrderByColumn(sortBy)
    const orderDirection = sortOrder === 'asc' ? asc : desc

    const query = baseQuery
      .orderBy(orderDirection(orderByColumn))
      .limit(limit)
      .offset(offset)

    const issues = await query

    const countQuery = db
      .select({ count: count() })
      .from(issuesTable)
      .where(whereClause)

    const [{ count: totalCount }] = await countQuery

    return {
      items: issues,
      pagination: {
        total: totalCount,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: offset + issues.length < totalCount,
        hasPreviousPage: offset > 0,
      },
    }
  }

  async getIssuesByRepositoryId(
    repositoryId: string,
    options: Omit<IssuesPaginationOptions, 'repositoryId'> = {},
  ) {
    return this.listAllIssues({
      ...options,
      repositoryId,
    })
  }

  private getIssuesOrderByColumn(sortBy: string) {
    switch (sortBy) {
      case 'createdAt':
        return issuesTable.createdAt
      case 'updatedAt':
        return issuesTable.updatedAt
      case 'githubCreatedAt':
        return issuesTable.githubCreatedAt
      case 'githubUpdatedAt':
        return issuesTable.githubUpdatedAt
      case 'comments':
        return issuesTable.comments
      case 'number':
        return issuesTable.number
      default:
        return issuesTable.githubCreatedAt
    }
  }

  private getOrderByColumn(sortBy: string) {
    switch (sortBy) {
      case 'stars':
        return repositoriesTable.stars
      case 'lastActivity':
        return repositoriesTable.lastActivity
      case 'createdAt':
        return repositoriesTable.createdAt
      case 'name':
        return repositoriesTable.name
      default:
        return repositoriesTable.stars
    }
  }
}
