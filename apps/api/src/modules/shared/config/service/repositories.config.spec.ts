import { Test, TestingModule } from '@nestjs/testing'
import { RepositoriesConfigService } from './repositories.config'
import * as fs from 'fs'
import * as path from 'path'
import * as toml from 'toml'
import { ConfigService } from './config.service'

jest.mock('fs')
jest.mock('path')
jest.mock('toml')

const mockFs = fs as jest.Mocked<typeof fs>
const mockPath = path as jest.Mocked<typeof path>
const mockToml = toml as jest.Mocked<typeof toml>

describe('RepositoriesConfigService', () => {
  let service: RepositoriesConfigService
  let _configService: jest.Mocked<ConfigService>

  const mockConfigContent = `
    repositories = [
    "github.com/owner1/repo1",
    "github.com/owner2/repo2"
    ]
`

  const mockParsedConfig = {
    repositories: ['github.com/owner1/repo1', 'github.com/owner2/repo2'],
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const mockConfigService = {
      get: jest.fn().mockReturnValue('production'),
    }

    mockPath.join.mockReturnValue('/mock/path/repositories.toml')
    mockPath.resolve.mockReturnValue('/mock/monorepo/root')
    mockFs.readFileSync.mockReturnValue(mockConfigContent)
    mockToml.parse.mockReturnValue(mockParsedConfig)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepositoriesConfigService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<RepositoriesConfigService>(RepositoriesConfigService)
    _configService = module.get<ConfigService>(
      ConfigService,
    ) as jest.Mocked<ConfigService>
  })

  describe('constructor', () => {
    it('should load the configuration on startup', () => {
      expect(mockPath.join).toHaveBeenCalledWith(
        process.cwd(),
        'repositories.toml',
      )
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        '/mock/path/repositories.toml',
        'utf8',
      )
      expect(mockToml.parse).toHaveBeenCalledWith(mockConfigContent)
    })

    it('should load config from monorepo root in development', async () => {
      jest.clearAllMocks()

      const mockConfigServiceDev = {
        get: jest.fn().mockReturnValue('development'),
      }

      mockPath.resolve.mockReturnValue('/mock/monorepo/root')
      mockPath.join.mockReturnValue('/mock/monorepo/root/repositories.toml')
      mockFs.readFileSync.mockReturnValue(mockConfigContent)
      mockToml.parse.mockReturnValue(mockParsedConfig)

      await Test.createTestingModule({
        providers: [
          RepositoriesConfigService,
          {
            provide: ConfigService,
            useValue: mockConfigServiceDev,
          },
        ],
      }).compile()

      expect(mockPath.resolve).toHaveBeenCalledWith(process.cwd(), '../..')
      expect(mockPath.join).toHaveBeenCalledWith(
        '/mock/monorepo/root',
        'repositories.toml',
      )
    })

    it('should throw error if it fails to load the file', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found')
      })

      const mockConfigServiceError = {
        get: jest.fn().mockReturnValue('production'),
      }

      await expect(
        Test.createTestingModule({
          providers: [
            RepositoriesConfigService,
            {
              provide: ConfigService,
              useValue: mockConfigServiceError,
            },
          ],
        }).compile(),
      ).rejects.toThrow('Failed to load repositories.toml: File not found')
    })

    it('should throw error if TOML parsing fails', async () => {
      mockToml.parse.mockImplementation(() => {
        throw new Error('Invalid TOML syntax')
      })

      const mockConfigServiceError = {
        get: jest.fn().mockReturnValue('production'),
      }

      await expect(
        Test.createTestingModule({
          providers: [
            RepositoriesConfigService,
            {
              provide: ConfigService,
              useValue: mockConfigServiceError,
            },
          ],
        }).compile(),
      ).rejects.toThrow('Failed to load repositories.toml: Invalid TOML syntax')
    })
  })

  describe('getAllRepositoryUrls', () => {
    it('should return all repository URLs', () => {
      const urls = service.getAllRepositoryUrls()

      expect(urls).toEqual([
        'github.com/owner1/repo1',
        'github.com/owner2/repo2',
      ])
    })

    it('should return empty array if there are no repositories', async () => {
      const emptyConfig = { repositories: [] }

      mockToml.parse.mockReturnValue(emptyConfig)

      const mockConfigServiceEmpty = {
        get: jest.fn().mockReturnValue('production'),
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          RepositoriesConfigService,
          {
            provide: ConfigService,
            useValue: mockConfigServiceEmpty,
          },
        ],
      }).compile()

      const serviceWithEmptyConfig = module.get<RepositoriesConfigService>(
        RepositoriesConfigService,
      )
      const urls = serviceWithEmptyConfig.getAllRepositoryUrls()

      expect(urls).toEqual([])
    })
  })

  describe('reloadConfig', () => {
    it('must reload the configuration', () => {
      jest.clearAllMocks()

      mockPath.join.mockReturnValue('/mock/path/repositories.toml')
      mockFs.readFileSync.mockReturnValue(mockConfigContent)
      mockToml.parse.mockReturnValue(mockParsedConfig)

      service.reloadConfig()

      expect(mockPath.join).toHaveBeenCalledWith(
        process.cwd(),
        'repositories.toml',
      )
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        '/mock/path/repositories.toml',
        'utf8',
      )
      expect(mockToml.parse).toHaveBeenCalledWith(mockConfigContent)
    })

    it('should throw error if reload fails', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      expect(() => {
        service.reloadConfig()
      }).toThrow('Failed to load repositories.toml: Permission denied')
    })

    it('must update configuration after reload', () => {
      const newConfig = {
        repositories: ['github.com/new/repo'],
      }

      mockToml.parse.mockReturnValue(newConfig)

      service.reloadConfig()

      expect(service.getAllRepositoryUrls()).toEqual(['github.com/new/repo'])
    })
  })
})
