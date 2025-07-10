import KeyvRedis from '@keyv/redis'
import Keyv from 'keyv'
import { ConfigService } from '../config/service/config.service'
import useCacheFactory from './cache.factory'

jest.mock('@keyv/redis')
jest.mock('keyv')

describe('useCacheFactory', () => {
  let mockConfigService: jest.Mocked<ConfigService>
  let mockKeyvRedis: jest.MockedClass<typeof KeyvRedis>
  let mockKeyv: jest.MockedClass<typeof Keyv>

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
      // biome-ignore lint/suspicious/noExplicitAny: <>
    } as any

    mockKeyvRedis = KeyvRedis as jest.MockedClass<typeof KeyvRedis>
    mockKeyv = Keyv as jest.MockedClass<typeof Keyv>

    jest.clearAllMocks()
  })

  it('should create Keyv instance with correct Redis configuration', async () => {
    const mockRedisConfig = {
      host: 'localhost',
      port: 6379,
      password: 'test-password',
    }

    mockConfigService.get.mockReturnValue(mockRedisConfig)

    await useCacheFactory(mockConfigService)

    expect(mockConfigService.get).toHaveBeenCalledWith('redis')
    expect(mockKeyvRedis).toHaveBeenCalledWith({
      host: 'localhost',
      port: 6379,
      password: 'test-password',
      tls: false,
    })
    expect(mockKeyv).toHaveBeenCalledWith({
      store: expect.any(mockKeyvRedis),
    })
  })

  it('should handle redis config without password', async () => {
    const mockRedisConfig = {
      host: 'redis-server',
      port: 6380,
      password: undefined,
    }

    mockConfigService.get.mockReturnValue(mockRedisConfig)

    await useCacheFactory(mockConfigService)

    expect(mockKeyvRedis).toHaveBeenCalledWith({
      host: 'redis-server',
      port: 6380,
      password: undefined,
      tls: false,
    })
  })

  it('should always set tls to false', async () => {
    const mockRedisConfig = {
      host: 'secure-redis',
      port: 6380,
      password: 'secure-password',
    }

    mockConfigService.get.mockReturnValue(mockRedisConfig)

    await useCacheFactory(mockConfigService)

    expect(mockKeyvRedis).toHaveBeenCalledWith(
      expect.objectContaining({
        tls: false,
      }),
    )
  })

  it('should return Keyv instance', async () => {
    const mockRedisConfig = {
      host: 'localhost',
      port: 6379,
      password: 'test-password',
    }
    const mockKeyvInstance = { mock: 'keyv-instance' }

    mockConfigService.get.mockReturnValue(mockRedisConfig)
    // biome-ignore lint/suspicious/noExplicitAny: <>
    mockKeyv.mockReturnValue(mockKeyvInstance as any)

    const result = await useCacheFactory(mockConfigService)

    expect(result).toBe(mockKeyvInstance)
  })
})
