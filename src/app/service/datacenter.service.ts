import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {Datacenter} from '../entity/master/datacenter'
import {Injectable} from '@nestjs/common'

@Injectable()
export class DatacenterService {
  constructor(
    @InjectRepository(Datacenter)
    private readonly datacenterRepository: Repository<Datacenter>,
  ) {
  }

  async findAll(): Promise<Datacenter[]> {
    return await this.datacenterRepository.find()
  }
}
