import { ApiProperty } from '@nestjs/swagger'
import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
} from 'class-validator'
import { Transform } from 'class-transformer'

export class GetIssuesDto {
  @ApiProperty({
    description: 'Number of issues to return per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value) || 10)
  limit: number = 10

  @ApiProperty({
    description: 'Number of issues to skip for pagination',
    example: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value) || 0)
  offset: number = 0

  @ApiProperty({
    description: 'Search term to filter issues by title',
    example: 'bug',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiProperty({
    description: 'Field to sort issues by',
    enum: [
      'createdAt',
      'updatedAt',
      'githubCreatedAt',
      'githubUpdatedAt',
      'comments',
      'number',
    ],
    example: 'githubCreatedAt',
    required: false,
  })
  @IsOptional()
  @IsEnum([
    'createdAt',
    'updatedAt',
    'githubCreatedAt',
    'githubUpdatedAt',
    'comments',
    'number',
  ])
  sortBy:
    | 'createdAt'
    | 'updatedAt'
    | 'githubCreatedAt'
    | 'githubUpdatedAt'
    | 'comments'
    | 'number' = 'githubCreatedAt'

  @ApiProperty({
    description: 'Sort order for the results',
    enum: ['asc', 'desc'],
    example: 'desc',
    required: false,
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc'

  @ApiProperty({
    description: 'Filter by issue state',
    enum: ['open', 'closed'],
    example: 'open',
    required: false,
  })
  @IsOptional()
  @IsEnum(['open', 'closed'])
  state?: 'open' | 'closed'

  @ApiProperty({
    description: 'Filter by good first issue',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value
  })
  isGoodFirstIssue?: boolean

  @ApiProperty({
    description: 'Filter by repository ID',
    example: '0197efc4-c54f-73b4-b4ac-5a2e57634a07',
    required: false,
  })
  @IsOptional()
  @IsString()
  repositoryId?: string
}
