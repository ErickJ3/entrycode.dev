import { PaginationInfo } from "./pagination"
import { Repository } from "./repository";
import { ApiProperty } from "@nestjs/swagger"

export class RepositoriesResponse {
  @ApiProperty({
    description: 'Array of repositories',
    type: [Repository],
  })
  data: Repository[]

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationInfo,
  })
  pagination: PaginationInfo
}
