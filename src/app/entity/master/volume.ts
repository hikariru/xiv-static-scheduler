import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {Raid} from './raid'

@Entity({name: 'volumes'})
export class Volume {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column({type: 'varchar', length: 255})
  readonly title: string

  @Column({type: 'varchar', length: 255})
  readonly patchNum: string

  @ManyToOne(() => Raid, (raid) => raid.volumes, {onUpdate: 'CASCADE'})
  readonly raid: Raid
}
