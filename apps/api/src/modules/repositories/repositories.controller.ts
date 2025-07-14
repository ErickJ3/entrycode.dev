import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common'
import { RepositoriesService } from './repositories.service'
import { RepositoriesResponse } from './dto/repository.res'
import { GetRepositoriesDto } from './dto/get-repositories.dto'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { LanguagesCountResponse } from './dto/languages-count.dto'
import { GetIssuesDto } from './dto/get-issue.dto'
import { IssuesResponse } from './dto/issue.res'
import { CacheInterceptor } from '@nestjs/cache-manager'

@ApiTags('Repositories')
@Controller('repositories')
@UseInterceptors(CacheInterceptor)
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
      items: data,
      total: data.length,
    }
  }

  @Get('issues')
  @ApiOperation({
    summary: 'Get issues with pagination and filtering',
    description:
      'Retrieves a paginated list of issues with optional search and sorting capabilities.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved issues',
    type: IssuesResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid query parameters',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getIssues(@Query() query: GetIssuesDto): Promise<IssuesResponse> {
    return await this.repositoriesService.listAllIssues({
      ...query,
      search: query.search || undefined,
    })
  }

  @Get(':repositoryId/issues')
  @ApiOperation({
    summary: 'Get issues for a specific repository',
    description:
      'Retrieves a paginated list of issues for a specific repository.',
  })
  @ApiParam({
    name: 'repositoryId',
    description: 'Repository ID',
    example: '0197efc4-c54f-73b4-b4ac-5a2e57634a07',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved repository issues',
    type: IssuesResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid parameters',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRepositoryIssues(
    @Param('repositoryId') repositoryId: string,
    @Query() query: Omit<GetIssuesDto, 'repositoryId'>,
  ): Promise<IssuesResponse> {
    return await this.repositoriesService.getIssuesByRepositoryId(
      repositoryId,
      {
        ...query,
        search: query.search || undefined,
      },
    )
  }
}
