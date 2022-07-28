import {Module} from '@nestjs/common'
import {ResumeController} from './resume.controller'
import {ServiceModule} from '../service/service.module'
import {CreateResumeService} from './create-resume.service'
import {TypeOrmModule} from '@nestjs/typeorm'
import {Player} from '../entity/transactional/player'

@Module({
  imports: [ServiceModule, TypeOrmModule.forFeature([Player])],
  controllers: [ResumeController],
  providers: [CreateResumeService],
  exports: [],
})
export class ResumeModule {
}
