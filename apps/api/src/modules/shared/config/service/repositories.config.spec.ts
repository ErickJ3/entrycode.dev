import { Test, TestingModule } from '@nestjs/testing'
import { RepositoriesConfigService } from './repositories.config'
import * as fs from 'fs'
import * as path from 'path'
import * as toml from 'toml'

jest.mock('fs')
jest.mock('path')
jest.mock('toml')

const mockFs = fs as jest.Mocked<typeof fs>
const mockPath = path as jest.Mocked<typeof path>
const mockToml = toml as jest.Mocked<typeof toml>

describe('RepositoriesConfigService', () => {
  let service: RepositoriesConfigService

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

    mockPath.join.mockReturnValue('/mock/path/repositories.toml')
    mockFs.readFileSync.mockReturnValue(mockConfigContent)
    mockToml.parse.mockReturnValue(mockParsedConfig)

    const module: TestingModule = await Test.createTestingModule({
      providers: [RepositoriesConfigService],
    }).compile()

    service = module.get<RepositoriesConfigService>(RepositoriesConfigService)
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

    it('should throw error if it fails to load the file', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found')
      })

      expect(() => {
        new RepositoriesConfigService()
      }).toThrow('Failed to load repositories.toml: File not found')
    })

    it('should throw error if TOML parsing fails', () => {
      mockToml.parse.mockImplementation(() => {
        throw new Error('Invalid TOML syntax')
      })

      expect(() => {
        new RepositoriesConfigService()
      }).toThrow('Failed to load repositories.toml: Invalid TOML syntax')
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

    it('should return empty array if there are no repositories', () => {
      mockToml.parse.mockReturnValue({ repositories: [] })
      const serviceWithEmptyConfig = new RepositoriesConfigService()

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
