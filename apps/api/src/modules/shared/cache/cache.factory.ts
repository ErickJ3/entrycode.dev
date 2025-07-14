import KeyvRedis from '@keyv/redis'
import Keyv from 'keyv'
import { ConfigService } from '../config/service/config.service'

async function useCacheFactory(config: ConfigService) {
  const redisConfig = {
    host: config.get('redis').host,
    port: config.get('redis').port,
    password: config.get('redis').password,
  }

  return new Keyv({
    store: new KeyvRedis(
      `redis://default:${redisConfig.password}@${redisConfig.host}:${redisConfig.port}`,
    ),
  })
}

export default useCacheFactory
