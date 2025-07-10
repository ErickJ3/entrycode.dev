import { Module } from '@nestjs/common'
import { TriggerService } from './trigger.service'
import { TriggerController } from './trigger.controller'
import { BullModule } from '@nestjs/bullmq'
import { Queue } from '~/constants/job.constant'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { RepositoriesConfigService } from '~/modules/shared/config/service/repositories.config'

@Module({
  imports: [
    BullModule.registerQueue({
      name: Queue.Populate,
    }),
    BullBoardModule.forFeature({
      name: Queue.Populate,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [TriggerController],
  providers: [TriggerService, RepositoriesConfigService],
})
export class TriggerModule {}
