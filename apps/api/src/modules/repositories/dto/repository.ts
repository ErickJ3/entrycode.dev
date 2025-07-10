import { ApiProperty } from '@nestjs/swagger'

export class Repository {
  @ApiProperty({
    description: 'Unique identifier for the repository',
    example: '0197efc4-c54f-73b4-b4ac-5a2e57634a07',
  })
  id: string

  @ApiProperty({
    description: 'Repository name',
    example: 'abp',
  })
  name: string

  @ApiProperty({
    description: 'Full repository name including owner',
    example: 'abpframework/abp',
  })
  fullName: string

  @ApiProperty({
    description: 'Repository description',
    example: 'Open-source web application framework for ASP.NET Core!',
    nullable: true,
  })
  description: string | null

  @ApiProperty({
    description: 'Primary programming language',
    example: 'C#',
    nullable: true,
  })
  language: string | null

  @ApiProperty({
    description: 'Number of stars',
    example: 13612,
  })
  stars: number

  @ApiProperty({
    description: 'GitHub repository URL',
    example: 'https://github.com/abpframework/abp',
  })
  url: string

  @ApiProperty({
    description: 'Repository owner username',
    example: 'abpframework',
  })
  owner: string

  @ApiProperty({
    description: 'Repository name without owner',
    example: 'abp',
  })
  repo: string

  @ApiProperty({
    description: 'Labels associated with the repository',
    type: [String],
    example: ['good-first-issue'],
    nullable: true,
  })
  labels: string[] | null

  @ApiProperty({
    description: 'Last activity timestamp',
    example: '2025-07-09T14:44:09.000Z',
    nullable: true,
  })
  lastActivity: Date | null

  @ApiProperty({
    description: 'Whether the repository is active',
    example: true,
  })
  isActive: boolean

  @ApiProperty({
    description: 'Repository creation timestamp',
    example: '2025-07-09T15:18:59.664Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Repository last update timestamp',
    example: '2025-07-09T15:20:22.479Z',
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Number of issues',
    example: 0,
  })
  issueCount: number
}
