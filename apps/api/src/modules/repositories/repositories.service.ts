import { db } from '~/database/client'
import { Injectable } from '@nestjs/common'
import { count, sql, asc, desc, and, ilike, SQL } from 'drizzle-orm'
import { issuesTable, repositoriesTable } from '~/database/schema'

interface PaginationOptions {
  limit?: number
  offset?: number
  search?: string
  sortBy?: 'stars' | 'lastActivity' | 'createdAt' | 'name'
  sortOrder?: 'asc' | 'desc'
}

@Injectable()
export class RepositoriesService {
  async listAllRepositories(options: PaginationOptions = {}) {
    const {
      limit = 10,
      offset = 0,
      search,
      sortBy = 'stars',
      sortOrder = 'desc',
    } = options

    const conditions: SQL<unknown>[] = []

    if (search) {
      conditions.push(ilike(repositoriesTable.fullName, `%${search}%`))
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
      data: repositories,
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
