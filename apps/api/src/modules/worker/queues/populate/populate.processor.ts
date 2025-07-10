import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { PopulateQueueService } from './populate.service'
import { PopulateJob } from './populate.type'
import {
  Job as JobName,
  Queue as QueueName,
} from '~/constants/job.constant'

@Processor(QueueName.Populate, {
  concurrency: 1,
  drainDelay: 300,
  stalledInterval: 300000,
  removeOnComplete: {
    age: 86400,
    count: 100,
  },
  limiter: {
    max: 1,
    duration: 150,
  },
})
export class PopulateProcessor extends WorkerHost {
  private readonly logger = new Logger(PopulateProcessor.name)
  constructor(private readonly populateQueueService: PopulateQueueService) {
    super()
  }
  // biome-ignore lint/suspicious/noExplicitAny: <>
  async process(job: Job<PopulateJob, void, string>): Promise<any> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}.`)

    switch (job.name) {
      case JobName.PopulateRepositories:
        return await this.populateQueueService.syncRepositories(job.data)
      default:
        throw new Error(`Unknown job name: ${job.name}`)
    }
  }

  @OnWorkerEvent('active')
  async onActive(job: Job) {
    this.logger.debug(`Job ${job.id} is now active`)
  }

  @OnWorkerEvent('progress')
  async onProgress(job: Job) {
    this.logger.debug(`Job ${job.id} is ${job.progress}% complete`)
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    this.logger.debug(`Job ${job.id} has been completed`)
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job) {
    this.logger.error(
      `Job ${job.id} has failed with reason: ${job.failedReason}`,
    )
    this.logger.error(job.stacktrace)
  }

  @OnWorkerEvent('stalled')
  async onStalled(job: Job) {
    this.logger.error(`Job ${job.id} has been stalled`)
  }

  @OnWorkerEvent('error')
  async onError(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} has failed with error: ${error}`)
  }
}
