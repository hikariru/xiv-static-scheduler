import {Controller, Get, Post, Render, Req, Res} from '@nestjs/common'
import {Request, Response} from 'express';

@Controller('sign-up')
export class SignUpController {
  @Get('')
  @Render('sign-up/index')
  create(@Req() req: Request, @Res() res: Response) {
    return {
      title: 'パーティーの登録',
      csrfToken: req.csrfToken(),
    }
  }

  @Post('create')
  terms() {
    return {title: 'Terms'}
  }
}
