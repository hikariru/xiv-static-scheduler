import {Module} from '@nestjs/common'
import {SignUpController} from './sign-up.controller'
import {ServiceModule} from '../service/service.module'

@Module({
  controllers: [SignUpController],
  providers: [],
  exports: [],
  imports: [ServiceModule],
})
export class SignUpModule {
}
