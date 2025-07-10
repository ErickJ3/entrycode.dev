import { BullRootModuleOptions } from '@nestjs/bullmq'
import { ConfigService } from '~/modules/shared/config/service/config.service'

export const useBullFactory = (
  configService: ConfigService,
): BullRootModuleOptions => {
  return {
    connection: {
      host: configService.get('redis').host,
      port: configService.get('redis').port,
      password: configService.get('redis').password,
    },
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
    },
  }
}
