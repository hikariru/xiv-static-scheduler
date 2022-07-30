import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'
import {Player} from './player'

@Entity()
export class Party {
  @PrimaryGeneratedColumn()
  readonly id?: number

  @Column({type: 'varchar', length: 255, unique: true})
  ulid: string

  @Column({type: 'varchar', length: 255})
  name: string

  @OneToMany(() => Player, (player) => player.party)
  players: Player[]

  @CreateDateColumn()
  readonly createdAt?: Date

  @UpdateDateColumn()
  readonly updatedAt?: Date

  constructor(ulid: string, name: string) {
    this.ulid = ulid
    this.name = name
  }
}
