import {Module} from '@nestjs/common'
import {LandingModule} from './app/landing/landing.module'
import {TypeOrmModule} from '@nestjs/typeorm'
import {SignUpModule} from "./app/sign-up/sign-up.module";

require('dotenv').config()

@Module({
  imports: [
    LandingModule,
    SignUpModule,
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
