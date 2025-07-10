import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { Queue as QueueName, Job as JobName } from '~/constants/job.constant'
import { PopulateJob } from '~/modules/worker/queues/populate/populate.type'
import { RepositoriesConfigService } from '~/modules/shared/config/service/repositories.config'

@Injectable()
export class TriggerService {
  private readonly GITHUB_RATE_LIMIT = 5000
  private readonly REQUESTS_PER_REPO = 2
  private readonly SAFETY_MARGIN = 0.8
  private readonly HOUR_IN_MS = 60 * 60 * 1000

  constructor(
    @InjectQueue(QueueName.Populate)
    private readonly populateQueue: Queue<PopulateJob, void, string>,
    private readonly repositoriesConfig: RepositoriesConfigService,
  ) {}

  async processRepositories(
    options: { repositories?: string[]; priority?: 'high' | 'normal' } = {},
  ) {
    const repositories =
      options.repositories || this.repositoriesConfig.getAllRepositoryUrls()

    const totalRequests = repositories.length * this.REQUESTS_PER_REPO
    const maxRequestsPerHour = this.GITHUB_RATE_LIMIT * this.SAFETY_MARGIN

    const delayBetweenJobs =
      totalRequests > maxRequestsPerHour
        ? Math.ceil(
            (this.HOUR_IN_MS / maxRequestsPerHour) * this.REQUESTS_PER_REPO,
          )
        : 1000

    const jobs = repositories.map((repo, index) => ({
      name: JobName.PopulateRepositories,
      data: { url: repo },
      opts: {
        priority: options.priority === 'high' ? 1 : 10,
        removeOnComplete: true,
        removeOnFail: 10,
        delay: index * delayBetweenJobs,
      },
    }))

    await this.populateQueue.addBulk(jobs)

    return {
      jobId: `sync-batch-${Date.now()}`,
      count: repositories.length,
      estimatedDuration: Math.ceil(
        (repositories.length * delayBetweenJobs) / 1000 / 60,
      ),
    }
  }
}
