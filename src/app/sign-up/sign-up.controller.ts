import {Body, Controller, Get, Post, Query, Render, Req, Res} from '@nestjs/common'
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
    @Body('partyName') partyName: string,
  ) {
    const createdParty = await this.partyService.create(partyName)
    return res.redirect('/sign-up/complete?partyId=' + createdParty.ulid)
  }

  @Get('/complete')
  @Render('sign-up/complete')
  complete(@Req() req: Request, @Query() query: { partyId: string }) {
    const partyUrl = req.protocol + '://' + req.get('host') + '/calendar?partyId=' + query.partyId

    return {
      title: 'パーティー作成完了',
      partyId: query.partyId,
      partyUrl: partyUrl,
    }
  }
}
