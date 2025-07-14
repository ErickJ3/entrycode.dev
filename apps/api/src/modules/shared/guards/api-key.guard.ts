import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '~/modules/shared/config/service/config.service'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const apiKey = request.headers['x-api-key']
    const validApiKey = this.configService.get('triggerSecret')

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key')
    }

    return true
  }
}
