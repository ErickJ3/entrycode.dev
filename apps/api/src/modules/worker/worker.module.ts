import { Module } from '@nestjs/common'
import { BullBoardDevModule } from './bull-board.module'
import { PopulateQueueModule } from './queues/populate/populate.module'

@Module({
  imports: [PopulateQueueModule, BullBoardDevModule],
})
export class WorkerModule {}
