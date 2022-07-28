import {Module} from '@nestjs/common'
import {RoleService} from './role.service'
import {TypeOrmModule} from '@nestjs/typeorm'
import {Role} from '../entity/master/role'
import {Player} from '../entity/transactional/player'
import {PlayerService} from './player.service'

@Module({
  imports: [TypeOrmModule.forFeature([Role, Player])],
  providers: [RoleService, PlayerService],
  exports: [RoleService, PlayerService],
})
export class ServiceModule {
}
