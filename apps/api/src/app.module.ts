import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule } from './modules/shared/config/config.module'
import { ConfigService } from './modules/shared/config/service/config.service'
import { useBullFactory } from './modules/worker/bull.factory'
import { WorkerModule } from './modules/worker/worker.module'
import { TriggerModule } from './modules/trigger/trigger.module'
import { CacheModule } from './modules/shared/cache/cache.module'
import { RepositoriesModule } from './modules/repositories/repositories.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: useBullFactory,
    }),
    WorkerModule,
    TriggerModule,
    CacheModule,
    RepositoriesModule,
  ],
})
export class AppModule {}
