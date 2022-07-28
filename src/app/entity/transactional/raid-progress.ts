import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {Player} from './player'
import {Volume} from '../master/volume'

@Entity({name: 'raidProgress'})
@Index(['playerId', 'volumeId'], {unique: true})
export class RaidProgress {
  @PrimaryGeneratedColumn()
  readonly id?: number

  @Column()
  playerId: number

  @ManyToOne(() => Player, (player) => player.raidProgress, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'playerId'})
  readonly player: Player

  @Column()
  volumeId: number

  @ManyToOne(() => Volume, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'volumeId'})
  readonly volume: Volume

  @Column({type: 'boolean'})
  cleared: boolean

  @CreateDateColumn()
  readonly createdAt?: Date

  @UpdateDateColumn()
  readonly updatedAt?: Date

  constructor(playerId: number, volumeId: number, cleared: boolean) {
    this.playerId = playerId
    this.volumeId = volumeId
    this.cleared = cleared
  }
}
