import { ApiProperty } from '@nestjs/swagger'

export class PaginationInfo {
  @ApiProperty({
    description: 'Total number of repositories',
    example: 11,
  })
  total: number

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number

  @ApiProperty({
    description: 'Number of items to skip',
    example: 0,
  })
  offset: number

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number

  @ApiProperty({
    description: 'Total number of pages',
    example: 2,
  })
  totalPages: number

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage: boolean

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPreviousPage: boolean
}
