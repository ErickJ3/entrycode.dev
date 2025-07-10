import { Controller, Get } from '@nestjs/common'
import { TriggerService } from './trigger.service'

@Controller('/trigger')
export class TriggerController {
  constructor(private readonly triggerService: TriggerService) {}

  @Get('sync')
  async startSync() {
    const processJobs = await this.triggerService.processRepositories()
    return processJobs
  }
}
