import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {Job} from './job'

@Entity({name: 'roles'})
export class Role {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column({type: 'varchar', length: 255})
  readonly name: string

  @OneToMany(() => Job, (job) => job.role, {eager: true})
  readonly jobs: Job[]
}
