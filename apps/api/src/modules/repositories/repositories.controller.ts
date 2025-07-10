import { Controller, Get, Query } from '@nestjs/common'
import { RepositoriesService } from './repositories.service'
import { RepositoriesResponse } from './dto/repository.res'
import { GetRepositoriesDto } from './dto/get-repositories.dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { LanguagesCountResponse } from './dto/languages-count.dto'

@ApiTags('Repositories')
@Controller('repositories')
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get repositories with pagination and filtering',
    description:
      'Retrieves a paginated list of repositories with optional search and sorting capabilities.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved repositories',
    type: RepositoriesResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid query parameters',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRepositories(
    @Query() query: GetRepositoriesDto,
  ): Promise<RepositoriesResponse> {
    return await this.repositoriesService.listAllRepositories({
      ...query,
      search: query.search || undefined,
    })
  }

  @Get('languages/count')
  @ApiOperation({
    summary: 'Get repository count by programming language',
    description:
      'Returns the number of repositories for each programming language.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved language statistics',
    type: LanguagesCountResponse,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRepositoriesCountByLanguage(): Promise<LanguagesCountResponse> {
    const data = await this.repositoriesService.getRepositoriesCountByLanguage()

    return {
      data,
      total: data.length,
    }
  }
}
