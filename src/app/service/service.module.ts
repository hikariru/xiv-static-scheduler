import {Module} from '@nestjs/common'
import {RoleService} from './role.service'
import {TypeOrmModule} from '@nestjs/typeorm'
import {Role} from '../entity/master/role'
import {Player} from '../entity/transactional/player'
import {PlayerService} from './player.service'
import {Party} from '../entity/transactional/party'
import {PartyService} from './party.service'

@Module({
  imports: [TypeOrmModule.forFeature([Role, Party, Player])],
  providers: [RoleService, PartyService, PlayerService],
  exports: [RoleService, PartyService, PlayerService],
})
export class ServiceModule {
}
