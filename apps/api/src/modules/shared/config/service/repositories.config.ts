import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import * as toml from 'toml'

interface RepositoriesConfig {
  repositories: string[]
}

@Injectable()
export class RepositoriesConfigService {
  private config: RepositoriesConfig

  constructor() {
    this.loadConfig()
  }

  private loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'repositories.toml')
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
}
