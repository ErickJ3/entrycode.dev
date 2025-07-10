import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { Queue } from '~/constants/job.constant'
import { GithubModule } from '~/modules/github/github.module'
import { PopulateQueueService } from './populate.service'
import { PopulateProcessor } from './populate.processor'
import { PopulateQueueEvents } from './populate.events'

@Module({
  imports: [
    GithubModule,
    BullModule.registerQueue({
      name: Queue.Populate,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
      defaultJobOptions: {
        delay: 300000,
      },
    }),
  ],
  providers: [PopulateQueueService, PopulateProcessor, PopulateQueueEvents],
})
export class PopulateQueueModule {}
