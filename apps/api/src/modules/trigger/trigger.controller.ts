import { Controller, Get, UseGuards } from '@nestjs/common'
import { TriggerService } from './trigger.service'
import { ApiKeyGuard } from '~/modules/shared/guards/api-key.guard'

@Controller('/trigger')
@UseGuards(ApiKeyGuard)
export class TriggerController {
  constructor(private readonly triggerService: TriggerService) {}

  @Get('sync')
  async startSync() {
    const processJobs = await this.triggerService.processRepositories()
    return processJobs
  }
}
