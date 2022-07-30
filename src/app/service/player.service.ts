import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {Injectable} from '@nestjs/common'
import {Player} from '../entity/transactional/player'
import {ulid as ulidGenerator} from 'ulid'

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {
  }

  async add(
    firstName: string,
    lastName: string,
    nickname: string,
    jobId: number,
    positionId: number,
    partyId: number,
  ): Promise<Player> {
    const ulid = ulidGenerator().toLowerCase()
    const player = new Player(ulid, firstName, lastName, nickname, jobId, positionId, partyId)

    return this.playerRepository.save(player)
  }
}
