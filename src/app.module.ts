import {Module} from '@nestjs/common'
import {LandingModule} from './app/landing/landing.module'
import {TypeOrmModule} from '@nestjs/typeorm'

require('dotenv').config()

@Module({
  imports: [
    LandingModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      logging: ['error', 'warn'],
      entities: ['./app/entity/**/*.ts', './dist/app/entity/**/*.js'],
    }),
  ],
})
export class AppModule {
}
