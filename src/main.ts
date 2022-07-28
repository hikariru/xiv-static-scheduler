import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {NestExpressApplication} from '@nestjs/platform-express'
import * as CookieParser from 'cookie-parser'
import {join} from 'path'
import * as hbs from 'hbs'
import {NotFoundExceptionFilter} from './app/common/filters/not-found-exception.filter'
import * as session from 'express-session'
import * as passport from 'passport'
import flash = require('connect-flash')
import * as csurf from 'csurf'
import * as helmet from 'helmet'
import {urlencoded} from 'express'
import * as compression from 'compression'

require('dotenv').config()

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.use(helmet())
  app.use(compression())

  app.useStaticAssets(join(__dirname, '..', 'public'))
  app.setBaseViewsDir(join(__dirname, '..', 'views'))

  app.setViewEngine('hbs')
  app.set('view options', {layout: 'layouts/main'})
  hbs.registerPartials(join(__dirname, '..', '/views/partials'))

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {secure: true, httpOnly: true, sameSite: true, maxAge: 24 * 60 * 60 * 1000},
    }),
  )

  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())

  app.use(CookieParser())
  app.use(
    urlencoded({
      extended: true,
    }),
  )
  app.use(csurf({sessionKey: process.env.SESSION_SECRET, cookie: true}))

  app.useGlobalFilters(new NotFoundExceptionFilter())
  await app.listen(Number(process.env.PORT) || 3000)
}

bootstrap()
