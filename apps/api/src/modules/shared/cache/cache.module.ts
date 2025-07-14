import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import {
  CacheInterceptor,
  CacheModule as CacheManagerModule,
} from '@nestjs/cache-manager'
import useCacheFactory from './cache.factory'
import { CacheService } from './cache.service'
import { APP_INTERCEPTOR } from '@nestjs/core'

@Module({
  imports: [
    ConfigModule,
    CacheManagerModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: useCacheFactory,
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: 'KEYV_CACHE',
      inject: [ConfigService],
      useFactory: useCacheFactory,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class CacheModule {}
