import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {createQueryBuilder, Repository} from 'typeorm'
import {Raid} from '../entity/master/raid'
import {Volume} from '../entity/master/volume'

@Injectable()
export class RaidService {
  constructor(
    @InjectRepository(Raid)
    private readonly raidRepository: Repository<Raid>,
  ) {
  }

  async findAll(): Promise<Raid[]> {
    const raids = await this.raidRepository.find({order: {id: 'ASC'}})

    // https://github.com/typeorm/typeorm/issues/2620
    raids.forEach((raid: Raid) => {
      raid.volumes.sort((first: Volume, second: Volume) => {
        if (first.id > second.id) {
          return 1
        } else if (first.id < second.id) {
          return -1
        } else {
          return 0
        }
      })
    })

    return raids
  }
}
