import {Body, Controller, Get, Post, Render, Req, Res, Session} from '@nestjs/common'
import {Request, Response} from 'express'
import {PartyService} from '../service/party.service'

@Controller('sign-up')
export class SignUpController {
  constructor(private readonly partyService: PartyService) {
  }

  @Get('')
  @Render('sign-up/index')
  index(@Req() req: Request, @Res() res: Response) {

    return {
      title: 'パーティーの登録',
      csrfToken: req.csrfToken(),
    }
  }

  @Post('')
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body('party_name') partyName: string,
    @Session() session: any
  ) {
    const createdParty = await this.partyService.create(partyName)

    session.message = '登録が完了しました！このページをブックマークしてください'
    return res.redirect('/party/' + createdParty.spaceId)
  }
}
