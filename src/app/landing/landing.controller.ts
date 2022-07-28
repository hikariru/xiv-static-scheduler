import {Controller, Get, Post, Render, Session} from '@nestjs/common'

@Controller()
export class LandingController {
  @Get()
  @Render('index')
  index() {
    return {title: 'Hello!'}
  }

  @Get('/terms')
  @Render('terms')
  terms() {
    return {title: 'Terms'}
  }
}
