import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm'

@Entity()
export class Position {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column({type: 'varchar', length: 255})
  readonly name: string
}
