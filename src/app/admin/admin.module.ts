import {Module} from '@nestjs/common';
import {ServiceModule} from "../service/service.module";
import {MemberController} from "./member.controller";

@Module({
  controllers: [MemberController],
  providers: [],
  exports: [],
  imports: [ServiceModule]
})
export class AdminModule {
}
