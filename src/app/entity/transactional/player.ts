import {
  AfterLoad,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {World} from '../master/world'
import {Profile} from './profile'
import {RaidProgress} from './raid-progress'
import {IsInt, IsNotEmpty, Matches} from 'class-validator'
import * as bcrypt from 'bcrypt'

require('dotenv').config()

@Entity({name: 'players'})
export class Player {
  @PrimaryGeneratedColumn()
  readonly id?: number

  @Column({type: 'varchar', length: 255})
  @Matches("^[A-Z][a-z'-]{1,14}$", 'i')
  firstName: string

  @Column({type: 'varchar', length: 255})
  @Matches("^[A-Z][a-z'-]{1,14}$", 'i')
  lastName: string

  @Column({type: 'int'})
  @IsInt()
  characterId: number

  @OneToOne(() => Profile)
  profile: Profile

  @OneToMany(() => RaidProgress, (raidProgress) => raidProgress.player)
  raidProgress: RaidProgress

  @IsNotEmpty()
  rawPassword: string

  @Column({type: 'varchar', length: 255})
  password?: string

  @Column()
  @IsInt()
  worldId: number

  @ManyToOne(() => World)
  @JoinColumn({name: 'worldId'})
  readonly world: World

  @CreateDateColumn()
  readonly createdAt?: Date

  @UpdateDateColumn()
  readonly updatedAt?: Date

  constructor(firstName: string, lastName: string, characterId: number, worldId: number, rawPassword?: string) {
    this.firstName = firstName
    this.lastName = lastName
    this.characterId = characterId
    this.worldId = worldId
    if (rawPassword) {
      this.rawPassword = rawPassword
    }
  }

  async validatePassword(password): Promise<boolean> {
    const hasedPassword = await bcrypt.hash(password, process.env.SALT)
    return this.password === hasedPassword
  }

  @AfterLoad()
  private loadPassword() {
    this.rawPassword = this.password
  }

  @BeforeInsert()
  private async encryptPassword() {
    if (this.rawPassword !== this.password) {
      this.password = await bcrypt.hash(this.rawPassword, process.env.SALT)
    }
  }
}
