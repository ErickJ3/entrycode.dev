import { Test, TestingModule } from '@nestjs/testing'
import Keyv from 'keyv'
import { CacheService } from './cache.service'
import { CacheKey } from '~/constants/cache.constant'

describe('CacheService', () => {
  let service: CacheService
  let mockKeyv: jest.Mocked<Keyv>

  beforeEach(async () => {
    mockKeyv = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      // biome-ignore lint/suspicious/noExplicitAny: <>
    } as any

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'KEYV_CACHE',
          useValue: mockKeyv,
        },
      ],
    }).compile()

    service = module.get<CacheService>(CacheService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('get', () => {
    it('should get value from cache with constructed key', async () => {
      const mockValue = { data: 'test' }
      const keyParams = {
        key: 'GithubRateLimit' as keyof typeof CacheKey,
        args: ['123'],
      }

      // biome-ignore lint/suspicious/noExplicitAny: <>
      mockKeyv.get.mockResolvedValue(mockValue as any)

      const result = await service.get(keyParams)

      expect(mockKeyv.get).toHaveBeenCalledWith(expect.stringContaining('123'))
      expect(result).toBe(mockValue)
    })

    it('should return undefined when key does not exist', async () => {
      const keyParams = {
        key: 'GithubRequestCount' as keyof typeof CacheKey,
        args: ['456'],
      }

      // biome-ignore lint/suspicious/noExplicitAny: <>
      mockKeyv.get.mockResolvedValue(undefined as any)

      const result = await service.get(keyParams)

      expect(result).toBeUndefined()
    })

    it('should handle key without args', async () => {
      const keyParams = { key: 'GithubLastRequest' as keyof typeof CacheKey }
      const mockValue = { config: 'value' }

      // biome-ignore lint/suspicious/noExplicitAny: <>
      mockKeyv.get.mockResolvedValue(mockValue as any)

      const result = await service.get(keyParams)

      expect(mockKeyv.get).toHaveBeenCalled()
      expect(result).toBe(mockValue)
    })

    it('should handle keyv errors', async () => {
      const error = new Error('Cache error')
      const keyParams = {
        key: 'GithubRateLimit' as keyof typeof CacheKey,
        args: ['123'],
      }

      mockKeyv.get.mockRejectedValue(error)

      await expect(service.get(keyParams)).rejects.toThrow('Cache error')
    })
  })

  describe('set', () => {
    it('should set value in cache with constructed key', async () => {
      const keyParams = {
        key: 'GithubRateLimit' as keyof typeof CacheKey,
        args: ['123'],
      }
      const value = { name: 'John' }

      mockKeyv.set.mockResolvedValue(true)

      const result = await service.set(keyParams, value)

      expect(mockKeyv.set).toHaveBeenCalledWith(
        expect.any(String),
        value,
        undefined,
      )
      expect(result).toEqual({ key: expect.any(String) })
    })

    it('should set value with TTL option', async () => {
      const keyParams = {
        key: 'GithubRequestCount' as keyof typeof CacheKey,
        args: ['123'],
      }
      const value = { name: 'John' }
      const options = { ttl: 3600 }

      mockKeyv.set.mockResolvedValue(true)

      const result = await service.set(keyParams, value, options)

      expect(mockKeyv.set).toHaveBeenCalledWith(expect.any(String), value, 3600)
      expect(result).toEqual({ key: expect.any(String) })
    })

    it('should handle key without args', async () => {
      const keyParams = { key: 'GithubLastRequest' as keyof typeof CacheKey }
      const value = { config: 'value' }

      mockKeyv.set.mockResolvedValue(true)

      const result = await service.set(keyParams, value)

      expect(mockKeyv.set).toHaveBeenCalled()
      expect(result).toEqual({ key: expect.any(String) })
    })

    it('should handle keyv errors', async () => {
      const error = new Error('Cache error')
      const keyParams = {
        key: 'GithubRateLimit' as keyof typeof CacheKey,
        args: ['123'],
      }

      mockKeyv.set.mockRejectedValue(error)

      await expect(service.set(keyParams, { data: 'test' })).rejects.toThrow(
        'Cache error',
      )
    })
  })

  describe('delete', () => {
    it('should delete value from cache with constructed key', async () => {
      const keyParams = {
        key: 'GithubRateLimit' as keyof typeof CacheKey,
        args: ['123'],
      }

      mockKeyv.delete.mockResolvedValue(true)

      const result = await service.delete(keyParams)

      expect(mockKeyv.delete).toHaveBeenCalledWith(expect.any(String))
      expect(result).toEqual({ key: expect.any(String) })
    })

    it('should handle key without args', async () => {
      const keyParams = { key: 'GithubLastRequest' as keyof typeof CacheKey }

      mockKeyv.delete.mockResolvedValue(true)

      const result = await service.delete(keyParams)

      expect(mockKeyv.delete).toHaveBeenCalled()
      expect(result).toEqual({ key: expect.any(String) })
    })

    it('should handle keyv errors', async () => {
      const error = new Error('Cache error')
      const keyParams = {
        key: 'GithubRateLimit' as keyof typeof CacheKey,
        args: ['123'],
      }

      mockKeyv.delete.mockRejectedValue(error)

      await expect(service.delete(keyParams)).rejects.toThrow('Cache error')
    })
  })

  describe('clear', () => {
    it('should clear all cache', async () => {
      mockKeyv.clear.mockResolvedValue(undefined)

      await service.clear()

      expect(mockKeyv.clear).toHaveBeenCalled()
    })

    it('should handle keyv errors', async () => {
      const error = new Error('Cache error')

      mockKeyv.clear.mockRejectedValue(error)

      await expect(service.clear()).rejects.toThrow('Cache error')
    })
  })

  describe('_constructCacheKey', () => {
    it('should construct cache key with args', () => {
      const keyParams = {
        key: 'GithubRateLimit' as keyof typeof CacheKey,
        args: ['123', 'profile'],
      }

      service.get(keyParams)

      expect(mockKeyv.get).toHaveBeenCalledWith(expect.any(String))

      const calledWith = mockKeyv.get.mock.calls[0][0]
      expect(typeof calledWith).toBe('string')
    })

    it('should construct cache key without args', () => {
      const keyParams = { key: 'GithubLastRequest' as keyof typeof CacheKey }

      service.get(keyParams)

      expect(mockKeyv.get).toHaveBeenCalledWith(expect.any(String))
    })
  })
})
