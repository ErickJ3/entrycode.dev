import { Octokit } from 'octokit'
import { Test, TestingModule } from '@nestjs/testing'
import { GithubService } from './github.service'
import { ConfigService } from '~/modules/shared/config/service/config.service'

jest.mock('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        get: jest.fn(),
      },
      issues: {
        listLabelsForRepo: jest.fn(),
        listForRepo: jest.fn(),
      },
    },
  })),
}))

describe('GithubService', () => {
  let service: GithubService
  let configService: ConfigService
  let mockOctokit: jest.Mocked<Octokit>

  const mockConfigService = {
    get: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    mockOctokit = {
      rest: {
        repos: {
          get: jest.fn(),
        },
        issues: {
          listLabelsForRepo: jest.fn(),
          listForRepo: jest.fn(),
        },
      },
    }

    ;(Octokit as jest.MockedClass<typeof Octokit>).mockImplementation(
      () => mockOctokit,
    )

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<GithubService>(GithubService)
    configService = module.get<ConfigService>(ConfigService)
  })

  describe('constructor', () => {
    it('should create Octokit instance with correct configuration', () => {
      const mockToken = 'test-github-token'
      mockConfigService.get.mockReturnValue(mockToken)

      new GithubService(configService)

      expect(mockConfigService.get).toHaveBeenCalledWith('githubToken')
      expect(Octokit).toHaveBeenCalledWith({
        auth: mockToken,
        retry: {
          enabled: true,
          doNotRetry: [400, 401, 403, 404, 422],
        },
      })
    })
  })

  describe('getRepositoriesMeta', () => {
    const mockRepoData = {
      name: 'test-repo',
      full_name: 'test-owner/test-repo',
      description: 'Test repository',
      language: 'TypeScript',
      stargazers_count: 100,
      html_url: 'https://github.com/test-owner/test-repo',
      topics: ['javascript', 'typescript'],
      updated_at: '2023-01-01T00:00:00Z',
    }

    const mockLabelsData = [
      { name: 'good first issue' },
      { name: 'help wanted' },
      { name: 'bug' },
      { name: 'enhancement' },
      { name: 'beginner' },
      { name: 'hacktoberfest' },
    ]

    beforeEach(() => {
      mockOctokit.rest.repos.get.mockResolvedValue({
        data: mockRepoData,
      })
      mockOctokit.rest.issues.listLabelsForRepo.mockResolvedValue({
        data: mockLabelsData,
      })
    })

    it('should return repository metadata successfully', async () => {
      const result = await service.getRepositoriesMeta(
        'test-owner',
        'test-repo',
      )

      expect(result).toEqual({
        name: 'test-repo',
        fullName: 'test-owner/test-repo',
        description: 'Test repository',
        language: 'TypeScript',
        stars: 100,
        url: 'https://github.com/test-owner/test-repo',
        owner: 'test-owner',
        repo: 'test-repo',
        topics: ['javascript', 'typescript'],
        labels: [
          'good first issue',
          'help wanted',
          'beginner',
          'hacktoberfest',
        ],
        lastActivity: '2023-01-01T00:00:00Z',
      })

      expect(mockOctokit.rest.repos.get).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
      })

      expect(mockOctokit.rest.issues.listLabelsForRepo).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        per_page: 100,
      })
    })

    it('should handle repository with no description', async () => {
      mockOctokit.rest.repos.get.mockResolvedValue({
        data: { ...mockRepoData, description: null },
      })

      const result = await service.getRepositoriesMeta(
        'test-owner',
        'test-repo',
      )

      expect(result.description).toBe('')
    })

    it('should handle repository with no language', async () => {
      mockOctokit.rest.repos.get.mockResolvedValue({
        data: { ...mockRepoData, language: null },
      })

      const result = await service.getRepositoriesMeta(
        'test-owner',
        'test-repo',
      )

      expect(result.language).toBe('unknown')
    })

    it('should handle repository with no topics', async () => {
      mockOctokit.rest.repos.get.mockResolvedValue({
        data: { ...mockRepoData, topics: null },
      })

      const result = await service.getRepositoriesMeta(
        'test-owner',
        'test-repo',
      )

      expect(result.topics).toEqual([])
    })

    it('should filter good first issue labels correctly', async () => {
      const labelsWithVariations = [
        { name: 'good first issue' },
        { name: 'good-first-issue' },
        { name: 'Beginner' },
        { name: 'EASY' },
        { name: 'Help Wanted' },
        { name: 'help-wanted' },
        { name: 'first-timers-only' },
        { name: 'up-for-grabs' },
        { name: 'Hacktoberfest' },
        { name: 'bug' },
        { name: 'enhancement' },
      ]

      mockOctokit.rest.issues.listLabelsForRepo.mockResolvedValue({
        data: labelsWithVariations,
      })

      const result = await service.getRepositoriesMeta(
        'test-owner',
        'test-repo',
      )

      expect(result.labels).toEqual([
        'good first issue',
        'good-first-issue',
        'beginner',
        'easy',
        'help wanted',
        'help-wanted',
        'first-timers-only',
        'up-for-grabs',
        'hacktoberfest',
      ])
    })

    it('should throw error when repository fetch fails', async () => {
      const errorMessage = 'Repository not found'
      mockOctokit.rest.repos.get.mockRejectedValue(new Error(errorMessage))

      await expect(
        service.getRepositoriesMeta('test-owner', 'test-repo'),
      ).rejects.toThrow(
        `Failed to fetch repository metadata for test-owner/test-repo: ${errorMessage}`,
      )
    })

    it('should throw error when labels fetch fails', async () => {
      const errorMessage = 'Labels not found'
      mockOctokit.rest.issues.listLabelsForRepo.mockRejectedValue(
        new Error(errorMessage),
      )

      await expect(
        service.getRepositoriesMeta('test-owner', 'test-repo'),
      ).rejects.toThrow(
        `Failed to fetch repository metadata for test-owner/test-repo: ${errorMessage}`,
      )
    })
  })

  describe('getGoodFirstIssues', () => {
    const mockIssues = [
      {
        id: 1,
        title: 'Issue 1',
        body: 'Description 1',
        pull_request: undefined,
      },
      {
        id: 2,
        title: 'Issue 2',
        body: 'Description 2',
        pull_request: undefined,
      },
      {
        id: 3,
        title: 'PR 1',
        body: 'Pull request',
        pull_request: { url: 'https://github.com/test/pr/1' },
      },
    ]

    beforeEach(() => {
      mockOctokit.rest.issues.listForRepo.mockResolvedValue({
        data: mockIssues,
      })
    })

    it('should return good first issues with default labels', async () => {
      const result = await service.getGoodFirstIssues('test-owner', 'test-repo')

      expect(result).toHaveLength(2)
      expect(result).toEqual([
        expect.objectContaining({ id: 1, title: 'Issue 1' }),
        expect.objectContaining({ id: 2, title: 'Issue 2' }),
      ])

      expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledTimes(5)
      expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        labels: 'good first issue',
        state: 'open',
        per_page: 50,
      })
    })

    it('should return issues with custom labels', async () => {
      const customLabels = ['beginner', 'easy']

      await service.getGoodFirstIssues('test-owner', 'test-repo', customLabels)

      expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledTimes(2)
      expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        labels: 'beginner',
        state: 'open',
        per_page: 50,
      })
      expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        labels: 'easy',
        state: 'open',
        per_page: 50,
      })
    })

    it('should filter out pull requests', async () => {
      const result = await service.getGoodFirstIssues('test-owner', 'test-repo')

      expect(result).toHaveLength(2)
      expect(result.every((issue) => !issue.pull_request)).toBe(true)
    })

    it('should handle duplicate issues from different labels', async () => {
      mockOctokit.rest.issues.listForRepo
        .mockResolvedValueOnce({ data: [mockIssues[0], mockIssues[1]] })
        .mockResolvedValueOnce({ data: [mockIssues[1], mockIssues[2]] })
        .mockResolvedValue({ data: [] })

      const result = await service.getGoodFirstIssues('test-owner', 'test-repo')

      expect(result).toHaveLength(2)
      expect(result.map((issue) => issue.id)).toEqual([1, 2])
    })

    it('should handle empty labels array', async () => {
      await service.getGoodFirstIssues('test-owner', 'test-repo', [])
      expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledTimes(5)
    })

    it('should handle API errors gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      mockOctokit.rest.issues.listForRepo
        .mockRejectedValueOnce(new Error('Label not found'))
        .mockResolvedValue({ data: mockIssues })

      const result = await service.getGoodFirstIssues('test-owner', 'test-repo')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Label "good first issue" not found in test-owner/test-repo',
      )
      expect(result).toBeDefined()
      consoleWarnSpy.mockRestore()
    })

    it('should return empty array when no issues found', async () => {
      mockOctokit.rest.issues.listForRepo.mockResolvedValue({ data: [] })
      const result = await service.getGoodFirstIssues('test-owner', 'test-repo')
      expect(result).toEqual([])
    })
  })
})
