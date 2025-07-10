import { ConfigService } from '~/modules/shared/config/service/config.service'
import { useBullFactory } from './bull.factory'

describe('useBullFactory', () => {
  let mockConfigService: jest.Mocked<ConfigService>

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
      // biome-ignore lint/suspicious/noExplicitAny: <>
    } as any
  })

  it('should return BullRootModuleOptions with correct configuration', () => {
    const mockRedisConfig = {
      host: 'localhost',
      port: 6379,
      password: 'test-password',
    }

    mockConfigService.get.mockReturnValue(mockRedisConfig)

    const result = useBullFactory(mockConfigService)

    expect(mockConfigService.get).toHaveBeenCalledWith('redis')
    expect(result).toEqual({
      connection: {
        host: 'localhost',
        port: 6379,
        password: 'test-password',
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
      },
    })
  })

  it('should handle redis config without password', () => {
    const mockRedisConfig = {
      host: 'redis-server',
      port: 6380,
      password: undefined,
    }

    mockConfigService.get.mockReturnValue(mockRedisConfig)

    const result = useBullFactory(mockConfigService)

    expect(result.connection).toEqual({
      host: 'redis-server',
      port: 6380,
      password: undefined,
    })
    expect(result.defaultJobOptions).toEqual({
      removeOnComplete: true,
      removeOnFail: false,
    })
  })

  it('should always return the same default job options', () => {
    const mockRedisConfig = {
      host: 'any-host',
      port: 1234,
      password: 'any-password',
    }

    mockConfigService.get.mockReturnValue(mockRedisConfig)

    const result = useBullFactory(mockConfigService)

    expect(result.defaultJobOptions).toEqual({
      removeOnComplete: true,
      removeOnFail: false,
    })
  })
})
