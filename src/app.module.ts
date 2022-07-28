import {Module} from '@nestjs/common'
import {LandingModule} from './app/landing/landing.module'
import {ResumeModule} from './app/resume/resume.module'
import {TypeOrmModule} from '@nestjs/typeorm'
import {AuthModule} from './app/auth/auth.module'

require('dotenv').config()

@Module({
  imports: [
    LandingModule,
    ResumeModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      logging: false,
      entities: ['./app/entity/**/*.ts', './dist/app/entity/**/*.js'],
    }),
  ],
})
export class AppModule {
}
