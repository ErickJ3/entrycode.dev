import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { TriggerService } from './trigger.service'
import { RepositoriesConfigService } from '~/modules/shared/config/service/repositories.config'
import { Queue as QueueName } from '~/constants/job.constant'

describe('TriggerService', () => {
  let service: TriggerService
  // biome-ignore lint/suspicious/noExplicitAny: <>
  let mockQueue: jest.Mocked<any>
  let mockRepositoriesConfig: jest.Mocked<RepositoriesConfigService>

  beforeEach(async () => {
    mockQueue = {
      addBulk: jest.fn().mockResolvedValue([]),
    }

    mockRepositoriesConfig = {
      getAllRepositoryUrls: jest
        .fn()
        .mockReturnValue([
          'github.com/default-repo1',
          'github.com/default-repo2',
        ]),
      // biome-ignore lint/suspicious/noExplicitAny: <>
    } as any

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TriggerService,
        {
          provide: getQueueToken(QueueName.Populate),
          useValue: mockQueue,
        },
        {
          provide: RepositoriesConfigService,
          useValue: mockRepositoriesConfig,
        },
      ],
    }).compile()

    service = module.get<TriggerService>(TriggerService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('processRepositories', () => {
    it('should process repositories with default options', async () => {
      const result = await service.processRepositories()

      expect(mockRepositoriesConfig.getAllRepositoryUrls).toHaveBeenCalled()
      expect(mockQueue.addBulk).toHaveBeenCalledWith([
        {
          name: 'populate-repositories',
          data: { url: 'github.com/default-repo1' },
          opts: {
            priority: 10,
            removeOnComplete: true,
            removeOnFail: 10,
            delay: 0,
          },
        },
        {
          name: 'populate-repositories',
          data: { url: 'github.com/default-repo2' },
          opts: {
            priority: 10,
            removeOnComplete: true,
            removeOnFail: 10,
            delay: 1000,
          },
        },
      ])

      expect(result).toEqual({
        jobId: expect.stringMatching(/^sync-batch-\d+$/),
        count: 2,
        estimatedDuration: expect.any(Number),
      })
    })

    it('should process repositories with high priority', async () => {
      const result = await service.processRepositories({ priority: 'high' })

      expect(mockQueue.addBulk).toHaveBeenCalledWith([
        {
          name: 'populate-repositories',
          data: { url: 'github.com/default-repo1' },
          opts: {
            priority: 1,
            removeOnComplete: true,
            removeOnFail: 10,
            delay: 0,
          },
        },
        {
          name: 'populate-repositories',
          data: { url: 'github.com/default-repo2' },
          opts: {
            priority: 1,
            removeOnComplete: true,
            removeOnFail: 10,
            delay: 1000,
          },
        },
      ])

      expect(result.count).toBe(2)
    })

    it('should use custom repositories when provided', async () => {
      const customRepos = ['github.com/custom-repo1', 'github.com/custom-repo2']

      const result = await service.processRepositories({
        repositories: customRepos,
      })

      expect(mockRepositoriesConfig.getAllRepositoryUrls).not.toHaveBeenCalled()

      expect(mockQueue.addBulk).toHaveBeenCalledWith([
        {
          name: 'populate-repositories',
          data: { url: 'github.com/custom-repo1' },
          opts: {
            priority: 10,
            removeOnComplete: true,
            removeOnFail: 10,
            delay: 0,
          },
        },
        {
          name: 'populate-repositories',
          data: { url: 'github.com/custom-repo2' },
          opts: {
            priority: 10,
            removeOnComplete: true,
            removeOnFail: 10,
            delay: 1000,
          },
        },
      ])

      expect(result.count).toBe(2)
    })

    it('should handle empty repositories array', async () => {
      const result = await service.processRepositories({ repositories: [] })

      expect(mockQueue.addBulk).toHaveBeenCalledWith([])
      expect(result.count).toBe(0)
      expect(result.estimatedDuration).toBe(0)
    })

    it('should return correct estimated duration', async () => {
      const result = await service.processRepositories()

      expect(result.estimatedDuration).toBeGreaterThanOrEqual(0)
      expect(typeof result.estimatedDuration).toBe('number')
    })

    it('should calculate delay correctly for multiple repositories', async () => {
      const multipleRepos = [
        'github.com/repo1',
        'github.com/repo2',
        'github.com/repo3',
      ]

      await service.processRepositories({ repositories: multipleRepos })

      expect(mockQueue.addBulk).toHaveBeenCalled()

      const calledWith = mockQueue.addBulk.mock.calls[0][0]
      expect(calledWith).toHaveLength(3)

      expect(calledWith[0].opts.delay).toBe(0)
      expect(calledWith[1].opts.delay).toBe(1000)
      expect(calledWith[2].opts.delay).toBe(2000)
    })

    it('should handle queue errors', async () => {
      const error = new Error('Queue error')
      mockQueue.addBulk.mockRejectedValue(error)

      await expect(service.processRepositories()).rejects.toThrow('Queue error')
    })
  })
})
