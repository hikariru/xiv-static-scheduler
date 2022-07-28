import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {Datacenter} from './datacenter'

@Entity({name: 'countries'})
export class Country {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column({type: 'varchar', length: 255})
  readonly countryCode: string

  @OneToMany(() => Datacenter, (datacenter) => datacenter.country)
  readonly datacenters: Datacenter[]
}
