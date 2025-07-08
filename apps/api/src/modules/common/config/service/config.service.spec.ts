import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { ConfigService } from './config.service'
import { createSharedConfig } from '../util/shared.config'
import { Test, TestingModule } from '@nestjs/testing'

describe('ConfigService', () => {
  let service: ConfigService

  beforeEach(async () => {
    process.env.NODE_ENV = 'test'

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        NestConfigModule.forRoot({
          load: [createSharedConfig],
          expandVariables: true,
          cache: true,
        }),
      ],
      providers: [ConfigService],
    }).compile()

    service = module.get<ConfigService>(ConfigService)
  })

  afterEach(() => {
    delete process.env.NODE_ENV
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('get', () => {
    it('should return environment value', () => {
      const env = service.get('env')
      expect(env).toBe('test')
    })
  })
})
