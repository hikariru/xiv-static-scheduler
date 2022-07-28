import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import {Player} from './player'
import {Job} from '../master/job'
import {IsInt, Matches} from 'class-validator'

@Entity({name: 'profiles'})
export class Profile {
  @PrimaryColumn({type: 'int'})
  playerId?: number

  @OneToOne(() => Player, (player) => player.profile, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'playerId'})
  readonly player: Player

  @Column()
  @IsInt()
  mainJobId: number

  @ManyToOne(() => Job)
  @JoinColumn({name: 'mainJobId'})
  readonly mainJob: Job

  @Column({type: 'varchar', length: 255, nullable: true})
  activeTime?: string

  @Column({type: 'varchar', length: 255, nullable: true})
  @Matches('^(\\w{1,15})$', 'i')
  twitterId?: string

  @Column({type: 'varchar', length: 255, nullable: true})
  @Matches('^(.*)#(\\d{4})$', 'i')
  discordId?: string

  @Column({type: 'varchar', nullable: true})
  description?: string

  @CreateDateColumn()
  readonly createdAt?: Date

  @UpdateDateColumn()
  readonly updatedAt?: Date

  constructor(mainJobId: number, twitterId: string, discordId: string, activeTime: string, description: string) {
    this.mainJobId = mainJobId
    this.twitterId = twitterId || null
    this.discordId = discordId || null
    this.activeTime = activeTime || null
    this.description = description || null
  }
}
