import {Body, Controller, Get, Post, Render, Req, Res, Session} from '@nestjs/common'
import {Request, Response} from 'express'
import {PartyService} from '../service/party.service'

@Controller('sign-up')
export class SignUpController {
  constructor(private readonly partyService: PartyService) {
  }

  @Get('')
  @Render('sign-up/index')
  index(@Req() req: Request, @Res() res: Response, @Session() session: any) {
    const errorMessage = session.errorMessage;
    session.errorMessage = '';

    return {
      title: 'パーティーの登録',
      errorMessage: errorMessage,
      csrfToken: req.csrfToken(),
    }
  }

  @Post('')
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body('party-name') partyName: string,
    @Session() session: any,
  ) {
    // const createdParty = await this.partyService.create(partyName)

    // if (!createdParty) {
    session.errorMessage = 'その名前はすでに使われています。別の名前をつけてください。'
    return res.redirect('/sign-up')
    // }

    return res.redirect('/party/settings' + partyName)
  }
}
