import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'
import {Matches} from 'class-validator'
import {Job} from '../master/job'
import {Player} from './player'

@Entity()
export class Party {
  @PrimaryGeneratedColumn()
  readonly id?: number

  @Column({type: 'varchar', length: 255, unique: true})
  @Matches('^[a-z-]$', 'i')
  name: string

  @Column({type: 'varchar', length: 255})
  nickName: string

  @OneToMany(() => Player, (player) => player.party, {eager: true})
  readonly players: Job[]

  @CreateDateColumn()
  readonly createdAt?: Date

  @UpdateDateColumn()
  readonly updatedAt?: Date

  constructor(name: string, nickname: string) {
    this.name = name
    this.nickName = nickname
  }
}
