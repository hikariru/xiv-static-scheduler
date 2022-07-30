import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {Injectable} from '@nestjs/common'
import {Party} from '../entity/transactional/party'
import {ulid as ulidGenerator} from 'ulid'

@Injectable()
export class PartyService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,
  ) {
  }

  async create(name: string): Promise<Party> {
    const ulid = ulidGenerator().toLowerCase()
    const party = new Party(ulid, name)

    return this.partyRepository.save(party)
  }

  async findByUlid(ulid: string): Promise<Party> {
    return this.partyRepository.findOne({where: {ulid: ulid}})
  }

  async update(id: number, name: string): Promise<Party> {
    let party = await this.partyRepository.findOne({where: {id: id}})

    party.name = name

    return this.partyRepository.save(party)
  }

  async delete(party: Party) {
    return this.partyRepository.remove(party)
  }
}
