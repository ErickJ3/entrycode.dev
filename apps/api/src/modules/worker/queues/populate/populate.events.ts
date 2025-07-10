import { Queue } from '~/constants/job.constant'
import {
  OnQueueEvent,
  QueueEventsHost,
  QueueEventsListener,
} from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'

@QueueEventsListener(Queue.Populate, { blockingTimeout: 300000 })
export class PopulateQueueEvents extends QueueEventsHost {
  private readonly logger = new Logger(PopulateQueueEvents.name)

  @OnQueueEvent('added')
  onAdded(job: { jobId: string; name: string }) {
    this.logger.debug(
      `Job ${job.jobId} of type ${job.name} has been added to the queue.`,
    )
  }

  @OnQueueEvent('waiting')
  onWaiting(job: { jobId: string; prev?: string }) {
    this.logger.debug(`Job ${job.jobId} is waiting`)
  }
}
