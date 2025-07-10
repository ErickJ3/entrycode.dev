import { Module } from '@nestjs/common'
import { RepositoriesService } from './repositories.service'
import { RepositoriesController } from './repositories.controller'

@Module({
  controllers: [RepositoriesController],
  providers: [RepositoriesService],
})
export class RepositoriesModule {}
