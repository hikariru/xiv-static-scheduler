import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {Injectable} from '@nestjs/common'
import {Party} from '../entity/transactional/party'
import {ulid} from "ulid";

@Injectable()
export class PartyService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,
  ) {
  }

  async create(name: string): Promise<Party> {
    const spaceId = ulid().toLowerCase();
    const party = new Party(spaceId, name)

    return this.partyRepository.save(party)
  }
}
