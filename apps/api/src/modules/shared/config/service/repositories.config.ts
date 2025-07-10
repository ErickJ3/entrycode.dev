import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import * as toml from 'toml'
import { ConfigService } from './config.service'

interface RepositoriesConfig {
  repositories: string[]
}

@Injectable()
export class RepositoriesConfigService {
  private config: RepositoriesConfig

  constructor(private readonly configService: ConfigService) {
    this.loadConfig()
  }

  private loadConfig() {
    try {
      const configPath = this.getConfigPath()
      const configContent = fs.readFileSync(configPath, 'utf8')
      this.config = toml.parse(configContent)
    } catch (error) {
      throw new Error(`Failed to load repositories.toml: ${error.message}`)
    }
  }

  getAllRepositoryUrls(): string[] {
    return this.config.repositories
  }

  reloadConfig() {
    this.loadConfig()
  }

  private getConfigPath(): string {
    const isDev = this.configService.get('env') === 'development'

    if (isDev) {
      const monorepoRoot = path.resolve(process.cwd(), '../..')
      return path.join(monorepoRoot, 'repositories.toml')
    } else {
      return path.join(process.cwd(), 'repositories.toml')
    }
  }
}
