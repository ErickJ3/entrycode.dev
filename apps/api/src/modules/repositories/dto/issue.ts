import { ApiProperty } from '@nestjs/swagger'

export class Issue {
  @ApiProperty({
    description: 'Unique identifier for the issue',
    example: '0197efc4-c54f-73b4-b4ac-5a2e57634a07',
  })
  id: string

  @ApiProperty({
    description: 'GitHub issue ID',
    example: 2332,
  })
  githubId: number

  @ApiProperty({
    description: 'Issue title',
    example: 'Fix authentication bug in login form',
  })
  title: string

  @ApiProperty({
    description: 'Number of comments',
    example: 5,
  })
  comments: number
}
