import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {NestExpressApplication} from '@nestjs/platform-express'
import * as CookieParser from 'cookie-parser'
import {join} from 'path'
import * as hbs from 'hbs'
import {NotFoundExceptionFilter} from './app/common/filters/not-found-exception.filter'
import * as csurf from 'csurf'
import {urlencoded} from 'express'
import * as compression from 'compression'
import * as session from 'express-session'
import helmet from "helmet";
import {xif} from "./app/helper/xif";

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
  hbs.registerHelper('xif', xif)

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  )

  app.use(CookieParser())
  app.use(
    urlencoded({
      extended: true,
    }),
  )
  app.use(csurf({sessionKey: process.env.SESSION_SECRET, cookie: {sameSite: true, maxAge: 24 * 60 * 60 * 1000}}))
  app.use((req: any, res: any, next: any) => {
    const token = req.csrfToken()
    res.cookie('XSRF-TOKEN', token)
    res.locals.csrfToken = token

    next()
  })

  app.useGlobalFilters(new NotFoundExceptionFilter())
  await app.listen(Number(process.env.PORT) || 3000)
}

bootstrap()
