import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {Datacenter} from './datacenter'

@Entity({name: 'worlds'})
export class World {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column({type: 'varchar', length: 255})
  readonly name: string

  @ManyToOne(() => Datacenter, (datacenter) => datacenter.worlds, {
    onUpdate: 'CASCADE',
  })
  readonly datacenter: Datacenter
}
