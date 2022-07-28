import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {Volume} from './volume'

@Entity({name: 'raids'})
export class Raid {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column({type: 'varchar', length: 255})
  readonly title: string

  @OneToMany(() => Volume, (volume) => volume.raid, {eager: true})
  volumes: Volume[]
}
