import { eq } from 'drizzle-orm'
import { Injectable } from '@nestjs/common'
import { PopulateJob } from './populate.type'
import { GithubService } from '~/modules/github/github.service'
import { db } from '~/database/client'
import {
  repositoriesTable,
  issuesTable,
  syncHistoryTable,
} from '~/database/schema'

@Injectable()
export class PopulateQueueService {
  constructor(private readonly githubService: GithubService) {}

  async syncRepositories(data: PopulateJob): Promise<Object> {
    const [_, owner, repo] = data.url.split('/')

    try {
      const meta = await this.githubService.getRepositoriesMeta(owner, repo)

      const [repository] = await db
        .insert(repositoriesTable)
        .values({
          name: meta.name,
          fullName: meta.fullName,
          description: meta.description,
          language: meta.language,
          stars: meta.stars,
          url: meta.url,
          owner: meta.owner,
          repo: meta.repo,
          labels: meta.labels,
          lastActivity: new Date(meta.lastActivity),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: repositoriesTable.fullName,
          set: {
            description: meta.description,
            language: meta.language,
            stars: meta.stars,
            labels: meta.labels,
            lastActivity: new Date(meta.lastActivity),
            updatedAt: new Date(),
          },
        })
        .returning()

      const [syncRecord] = await db
        .insert(syncHistoryTable)
        .values({
          repositoryId: repository.id,
          syncType: 'full',
          status: 'running',
        })
        .returning()

      const issues = await this.githubService.getGoodFirstIssues(owner, repo)
      console.log(`Found ${issues.length} issues for ${repository.fullName}`)

      let issuesProcessed = 0

      for (const issue of issues) {
        try {
          await db
            .insert(issuesTable)
            .values({
              githubId: issue.id.toString(),
              number: issue.number,
              title: issue.title,
              state: issue.state,
              url: issue.url,
              repositoryId: repository.id,
              comments: issue.comments,
              isGoodFirstIssue: true,
              githubCreatedAt: new Date(issue.created_at),
              githubUpdatedAt: new Date(issue.updated_at),
            })
            .onConflictDoUpdate({
              target: issuesTable.githubId,
              set: {
                title: issue.title,
                state: issue.state,
                comments: issue.comments,
                githubUpdatedAt: new Date(issue.updated_at),
                updatedAt: new Date(),
              },
            })
            .returning()

          issuesProcessed++
        } catch (error) {
          console.error(`Error processing issue ${issue.number}:`, error)
        }
      }

      await db
        .update(syncHistoryTable)
        .set({
          status: 'completed',
          issuesFound: issues.length,
          issuesProcessed: issuesProcessed,
          completedAt: new Date(),
          duration: Math.floor(
            (Date.now() - new Date(syncRecord.startedAt).getTime()) / 1000,
          ),
        })
        .where(eq(syncHistoryTable.id, syncRecord.id))

      return {
        message: 'Repository synchronized successfully',
        repository: repository.fullName,
        issuesFound: issues.length,
        issuesProcessed: issuesProcessed,
        syncId: syncRecord.id,
      }
    } catch (error) {
      console.error('Error during sync:', error)
      throw error
    }
  }
}
