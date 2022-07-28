import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {World} from './world'
import {Country} from './country'

@Entity({name: 'datacenters'})
export class Datacenter {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column({type: 'varchar', length: 255})
  readonly name: string

  @ManyToOne(() => Country, (country) => country.datacenters, {
    onUpdate: 'CASCADE',
  })
  readonly country: Country

  @OneToMany(() => World, (world) => world.datacenter, {eager: true})
  readonly worlds: World[]
}
