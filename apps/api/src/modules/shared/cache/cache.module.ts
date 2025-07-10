import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import useCacheFactory from './cache.factory'
import { CacheService } from './cache.service'

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'KEYV_CACHE',
      inject: [ConfigService],
      useFactory: useCacheFactory,
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class CacheModule {}
