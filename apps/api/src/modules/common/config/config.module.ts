import { DynamicModule, Global, Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { ConfigService } from './service/config.service'
import { createSharedConfig } from './util/shared.config'

@Global()
@Module({})
export class ConfigModule {
  static forRoot(): DynamicModule {
    return {
      module: ConfigModule,
      imports: [
        NestConfigModule.forRoot({
          load: [createSharedConfig],
          expandVariables: true,
          cache: true,
        }),
      ],
      providers: [ConfigService],
      exports: [ConfigService],
    }
  }
}
