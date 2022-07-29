import {Body, Controller, Get, Param, ParseIntPipe, Post, Render, Req, Res, Session} from '@nestjs/common'
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
      title: 'パーティーの作成',
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
    return res.redirect('/sign-up/complete/' + createdParty.spaceId)
  }

  @Get('/complete/:spaceId')
  @Render('sign-up/complete')
  complete(@Param('spaceId', new ParseIntPipe()) spaceId,
           @Req() req: Request,) {
    const spaceUrl = req.protocol + '://' + req.get('host') + '/calendar/' + spaceId

    return {
      title: 'パーティー作成完了',
      spaceUrl: spaceUrl
    }
  }
}
