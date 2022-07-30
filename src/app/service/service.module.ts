import {Module} from '@nestjs/common'
import {RoleService} from './role.service'
import {TypeOrmModule} from '@nestjs/typeorm'
import {Role} from '../entity/master/role'
import {Player} from '../entity/transactional/player'
import {PlayerService} from './player.service'
import {Party} from '../entity/transactional/party'
import {PartyService} from './party.service'
import {Position} from "../entity/master/position";
import {PositionService} from "./position.service";

@Module({
  imports: [TypeOrmModule.forFeature([Role, Party, Position, Player])],
  providers: [RoleService, PartyService, PositionService, PlayerService],
  exports: [RoleService, PartyService, PositionService, PlayerService],
})
export class ServiceModule {
}
