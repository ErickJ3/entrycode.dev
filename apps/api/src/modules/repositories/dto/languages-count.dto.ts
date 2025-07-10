import { ApiProperty } from '@nestjs/swagger'

export class LanguageCountDto {
  @ApiProperty({ description: 'Programming language name' })
  language: string

  @ApiProperty({ description: 'Number of repositories for this language' })
  count: number
}

export class LanguagesCountResponse {
  @ApiProperty({
    type: [LanguageCountDto],
    description: 'List of languages with their repository counts',
  })
  data: LanguageCountDto[]

  @ApiProperty({ description: 'Total number of different languages' })
  total: number
}
