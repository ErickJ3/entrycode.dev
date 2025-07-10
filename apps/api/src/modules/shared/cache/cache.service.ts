import Keyv from 'keyv'
import util from 'node:util'
import { Inject, Injectable } from '@nestjs/common'
import { CacheParam } from './cache.type'
import { CacheKey } from '~/constants/cache.constant'

@Injectable()
export class CacheService {
  constructor(
    @Inject('KEYV_CACHE')
    private readonly keyv: Keyv,
  ) {}

  async get<T>(keyParams: CacheParam): Promise<T | undefined> {
    return this.keyv.get<T>(this._constructCacheKey(keyParams))
  }

  async set(
    keyParams: CacheParam,
    value: unknown,
    options?: {
      ttl?: number
    },
  ): Promise<{ key: string }> {
    const key = this._constructCacheKey(keyParams)
    await this.keyv.set(key, value, options?.ttl)
    return { key }
  }

  async delete(keyParams: CacheParam): Promise<{ key: string }> {
    const key = this._constructCacheKey(keyParams)
    await this.keyv.delete(key)
    return { key }
  }

  async clear(): Promise<void> {
    await this.keyv.clear()
  }

  private _constructCacheKey(keyParams: CacheParam): string {
    return util.format(CacheKey[keyParams.key], ...(keyParams.args ?? []))
  }
}
