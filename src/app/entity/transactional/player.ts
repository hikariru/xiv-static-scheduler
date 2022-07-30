import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {IsInt, Matches} from 'class-validator'
import {Party} from './party'
import {Job} from '../master/job'
import {Position} from '../master/position'

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  readonly id?: number

  @Column({type: 'varchar', length: 255, unique: true})
  ulid: string

  @Column({type: 'varchar', length: 255})
  @Matches("^[A-Z][a-z'\-]{1,14}$", 'i')
  firstName: string

  @Column({type: 'varchar', length: 255})
  @Matches("^[A-Z][a-z'\-]{1,14}$", 'i')
  lastName: string

  @Column({type: 'varchar', length: 255, nullable: true})
  nickName: string

  @Column()
  @IsInt()
  jobId: number

  @ManyToOne(() => Job)
  @JoinColumn({name: 'jobId'})
  readonly job: Job

  @Column()
  @IsInt()
  positionId: number

  @ManyToOne(() => Position)
  @JoinColumn({name: 'positionId'})
  readonly position: Position

  @Column()
  @IsInt()
  partyId: number

  @ManyToOne(() => Party, () => {
  }, {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  @JoinColumn({name: 'partyId'})
  readonly party: Party

  @CreateDateColumn()
  readonly createdAt?: Date

  @UpdateDateColumn()
  readonly updatedAt?: Date

  constructor(
    ulid: string,
    firstName: string,
    lastName: string,
    nickname: string,
    jobId: number,
    positionId: number,
    partyId: number,
  ) {
    this.ulid = ulid
    this.firstName = firstName
    this.lastName = lastName
    this.nickName = nickname
    this.jobId = jobId
    this.positionId = positionId
    this.partyId = partyId
  }
}
