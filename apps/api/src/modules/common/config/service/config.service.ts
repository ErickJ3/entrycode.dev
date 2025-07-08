import { Injectable } from '@nestjs/common'
import { ConfigService as NestConfigService } from '@nestjs/config'
import type { SharedConfig } from '../util/shared.config'

@Injectable()
export class ConfigService extends NestConfigService<SharedConfig, true> {
  get<T extends keyof SharedConfig>(key: T): SharedConfig[T] {
    return super.get(key, { infer: true })!
  }
}
