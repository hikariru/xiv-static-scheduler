import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {Injectable} from '@nestjs/common'
import {Player} from '../entity/transactional/player'
import {ulid as ulidGenerator} from 'ulid'
import {validate} from 'class-validator'
import {Job} from "../entity/master/job";
import {Position} from "../entity/master/position";

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>
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

    let errors = await validate(player)
    if (errors.length !== 0) {
      console.warn(errors)
      return null
    }

    return this.playerRepository.save(player)
  }

  async findByPartyId(partyId): Promise<Player[]> {
    return this.playerRepository.find({where: {partyId: partyId}, order: {positionId: 'ASC'}})
  }

  async findByUlid(ulid: string) {
    return this.playerRepository.findOne({where: {ulid: ulid}})
  }

  async delete(player: Player) {
    return this.playerRepository.remove(player)
  }

  async update(
    id: number,
    firstName: string,
    lastName: string,
    nickname: string,
    jobId: number,
    positionId: number,
  ): Promise<Player> {
    let player = await this.playerRepository.findOne({where: {id: id}})

    player.firstName = firstName
    player.lastName = lastName
    player.nickname = nickname
    player.job = await this.jobRepository.findOne({where: {id: jobId}})
    player.position = await this.positionRepository.findOne({where: {id: positionId}})

    return this.playerRepository.save(player)
  }
}
