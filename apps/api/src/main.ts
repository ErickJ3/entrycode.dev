import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { ConfigService } from './modules/shared/config/service/config.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  if (configService.get('env') === 'development') {
    const config = new DocumentBuilder()
      .setTitle(configService.get('app').name)
      .setDescription(configService.get('app').description)
      .setVersion(configService.get('app').version)
      .build()

    const documentFactory = () => SwaggerModule.createDocument(app, config)

    SwaggerModule.setup('docs', app, documentFactory, {
      jsonDocumentUrl: 'docs/json',
    })
  }

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  })

  const port = configService.get('port')
  await app.listen(port)
}

bootstrap()
