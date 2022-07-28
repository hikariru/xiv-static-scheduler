import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Player} from '../entity/transactional/player'
import {getManager, Repository} from 'typeorm'
import {validate} from 'class-validator'
import {Profile} from '../entity/transactional/profile'

@Injectable()
export class CreateResumeService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {
  }

  async create(
    firstName: string,
    lastName: string,
    rawCharacterId: string,
    rawWorldId: string,
    rawPassword: string,
    rawMainJobId: string,
    twitterId: string,
    discordId: string,
    activeTime: string,
    description: string,
    raidProgress: string[],
  ): Promise<number> {
    const characterId = Number(rawCharacterId)
    const worldId = Number(rawWorldId)

    const player = new Player(firstName, lastName, characterId, worldId, rawPassword)

    let errors = await validate(player)
    if (errors.length !== 0) {
      console.log(errors)
      return 0
    }

    const jobId = Number(rawMainJobId)
    const profile = new Profile(jobId, twitterId, discordId, activeTime, description)

    errors = await validate(profile)
    if (errors.length !== 0) {
      console.log(errors)
      return 0
    }

    player.profile = profile

    try {
      await getManager().transaction(async (transactionalEntityManager) => {
        const savedPlayer = await transactionalEntityManager.save(player)
        profile.playerId = savedPlayer.id
        await transactionalEntityManager.save(profile)

        return savedPlayer.id
      })
    } catch (error) {
      console.error('Failed to Exec Transaction: ', error)
      return 0
    }
  }
}
