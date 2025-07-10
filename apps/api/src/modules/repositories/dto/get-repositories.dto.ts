import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsEnum, IsInt, Min, Max, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class GetRepositoriesDto {
  @ApiProperty({
    description: 'Number of repositories to return per page',
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
    description: 'Number of repositories to skip for pagination',
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
    description: 'Search term to filter repositories by name or description',
    example: 'react',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiProperty({
    description: 'Field to sort repositories by',
    enum: ['stars', 'lastActivity', 'createdAt', 'name'],
    example: 'stars',
    required: false,
  })
  @IsOptional()
  @IsEnum(['stars', 'lastActivity', 'createdAt', 'name'])
  sortBy: 'stars' | 'lastActivity' | 'createdAt' | 'name' = 'stars'

  @ApiProperty({
    description: 'Sort order for the results',
    enum: ['asc', 'desc'],
    example: 'desc',
    required: false,
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc'
}
