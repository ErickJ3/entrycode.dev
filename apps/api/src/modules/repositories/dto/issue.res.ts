import { ApiProperty } from '@nestjs/swagger'
import { PaginationInfo } from './pagination'
import { Issue } from './issue'

export class IssuesResponse {
  @ApiProperty({
    description: 'Array of issues',
    type: [Issue],
  })
  items: Issue[]

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationInfo,
  })
  pagination: PaginationInfo
}
