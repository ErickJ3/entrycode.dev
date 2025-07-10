import { BullBoardModule } from '@bull-board/nestjs'
import { Module } from '@nestjs/common'
import { ConfigModule } from '~/modules/shared/config/config.module'
import { ConfigService } from '~/modules/shared/config/service/config.service'
import { ExpressAdapter } from '@bull-board/express'

@Module({
  imports: [
    BullBoardModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        route: '/admin/queues',
        adapter: ExpressAdapter,
        boardOptions: {
          uiConfig: {
            boardTitle: `Bull Board - ${configService.get('app').name}`,
          },
        },
      }),
    }),
  ],
})
export class BullBoardDevModule {}
