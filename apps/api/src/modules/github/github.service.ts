import { Injectable } from '@nestjs/common'
import { Octokit } from 'octokit'
import { Endpoints } from '@octokit/types'
import { ConfigService } from '~/modules/shared/config/service/config.service'

type Issue =
  Endpoints['GET /repos/{owner}/{repo}/issues']['response']['data'][0]

@Injectable()
export class GithubService {
  private readonly octokit: Octokit

  constructor(private readonly configService: ConfigService) {
    this.octokit = new Octokit({
      auth: this.configService.get('githubToken'),
      retry: {
        enabled: true,
        doNotRetry: [400, 401, 403, 404, 422],
      },
    })
  }

  async getRepositoriesMeta(owner: string, repo: string) {
    try {
      const { data: repoData } = await this.octokit.rest.repos.get({
        owner,
        repo,
      })

      const { data: labelsData } =
        await this.octokit.rest.issues.listLabelsForRepo({
          owner,
          repo,
          per_page: 100,
        })

      const goodFirstIssueLabels = labelsData
        .map((label) => label.name.toLowerCase())
        .filter(
          (name) =>
            name.includes('good first issue') ||
            name.includes('good-first-issue') ||
            name.includes('beginner') ||
            name.includes('easy') ||
            name.includes('help wanted') ||
            name.includes('help-wanted') ||
            name.includes('first-timers-only') ||
            name.includes('up-for-grabs') ||
            name.includes('hacktoberfest'),
        )

      return {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description || '',
        language: repoData.language || 'unknown',
        stars: repoData.stargazers_count,
        url: repoData.html_url,
        owner,
        repo,
        topics: repoData.topics || [],
        labels: goodFirstIssueLabels,
        lastActivity: repoData.updated_at,
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch repository metadata for ${owner}/${repo}: ${error.message}`,
      )
    }
  }

  async getGoodFirstIssues(owner: string, repo: string, labels: string[] = []) {
    const searchLabels =
      labels.length > 0
        ? labels
        : [
            'good first issue',
            'good-first-issue',
            'beginner',
            'easy',
            'help wanted',
          ]

    const issues: Issue[] = []

    for (const label of searchLabels) {
      try {
        const { data } = await this.octokit.rest.issues.listForRepo({
          owner,
          repo,
          labels: label,
          state: 'open',
          per_page: 50,
        })

        issues.push(...data.filter((issue) => !issue.pull_request))
      } catch {
        console.warn(`Label "${label}" not found in ${owner}/${repo}`)
      }
    }

    const uniqueIssues = issues.filter(
      (issue, index, self) =>
        index === self.findIndex((i) => i.id === issue.id),
    )

    return uniqueIssues
  }
}
