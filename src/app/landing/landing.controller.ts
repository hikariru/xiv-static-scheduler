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

  @Get('/signup')
  @Render('authentication')
  signup(@Session() session: Record<string, any>) {
    // TODO
    // 1. gen base64 token "RESUME="{A-Z,a-z,0-9}{32}"
    // 2. set it into session
    // 3. render with token
  }

  @Post('/signup')
  validatePlayer(@Session() session: Record<string, any>) {
    // TODO
    // 1. get token from session
    // 2. retrieve token from lodestone
    // 3. validate token
    // if the player has own resume already
    // redirect to resume page with flash message like "プロフィールを作成済みなようです"
    // else, redirect to create page
  }
}
