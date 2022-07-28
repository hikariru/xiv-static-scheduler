import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {Role} from '../entity/master/role'
import {Job} from '../entity/master/job'

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.roleRepository.find()

    // https://github.com/typeorm/typeorm/issues/2620
    // ↑関係なかった
    roles.forEach((role: Role) => {
      role.jobs.sort((first: Job, second: Job) => {
        if (first.id > second.id) {
          return 1
        } else if (first.id < second.id) {
          return -1
        } else {
          return 0
        }
      })
    })

    return roles
  }
}
