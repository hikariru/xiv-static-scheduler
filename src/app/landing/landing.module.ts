import {Module} from '@nestjs/common'
import {LandingController} from './landing.controller'

@Module({
  controllers: [LandingController],
  providers: [],
  exports: [],
})
export class LandingModule {
}
