import {Module} from '@nestjs/common'
import {AuthService} from './auth.service'
import {ServiceModule} from '../service/service.module'
import {PassportModule} from '@nestjs/passport'
import {LocalStrategy} from './local.strategy'
import {SessionSerializer} from './session.serializer'

@Module({
  imports: [ServiceModule, PassportModule],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AuthModule {
}
