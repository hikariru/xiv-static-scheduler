import {Module} from '@nestjs/common'
import {ServiceModule} from '../service/service.module'
import {MemberController} from './member.controller'
import {PartyController} from "./party.controller";

@Module({
  controllers: [MemberController, PartyController],
  providers: [],
  exports: [],
  imports: [ServiceModule],
})
export class AdminModule {
}
