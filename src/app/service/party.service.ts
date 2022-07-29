import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {Injectable} from '@nestjs/common'
import {validate} from 'class-validator'
import {Party} from '../entity/transactional/party'

@Injectable()
export class PartyService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,
  ) {
  }

  async findByName(partyName: string): Promise<Party> {
    return await this.partyRepository.findOne({where: {name: partyName}})
  }

  async create(partyName: string): Promise<Party> {
    const existedParty = this.findByName(partyName)

    if (existedParty) {
      return null
    }

    const party = new Party(partyName)

    let errors = await validate(party)
    if (errors.length !== 0) {
      console.info(errors)
      return null
    }

    return this.partyRepository.save(party)
  }
}
