import {Module} from '@nestjs/common'
import {RoleService} from './role.service'
import {DatacenterService} from './datacenter.service'
import {TypeOrmModule} from '@nestjs/typeorm'
import {Datacenter} from '../entity/master/datacenter'
import {Role} from '../entity/master/role'
import {Raid} from '../entity/master/raid'
import {RaidService} from './raid.service'
import {Player} from '../entity/transactional/player'
import {PlayerService} from './player.service'

@Module({
  imports: [TypeOrmModule.forFeature([Role, Datacenter, Raid, Player])],
  providers: [RoleService, DatacenterService, RaidService, PlayerService],
  exports: [RoleService, DatacenterService, RaidService, PlayerService],
})
export class ServiceModule {
}
