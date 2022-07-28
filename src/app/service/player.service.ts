import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {Injectable} from '@nestjs/common'
import {Player} from '../entity/transactional/player'
import {validate} from 'class-validator'

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {
  }

  async findByPlayerId(playerId: number): Promise<Player> {
    return await this.playerRepository.findOne({id: playerId})
  }
}
