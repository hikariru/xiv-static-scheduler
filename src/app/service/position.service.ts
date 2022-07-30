import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {Position} from 'app/entity/master/position'

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) {
  }

  async findAll(): Promise<Position[]> {
    return await this.positionRepository.find()
  }
}
