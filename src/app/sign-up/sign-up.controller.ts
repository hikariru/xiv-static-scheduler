import {
  Body,
  Controller,
  Get,
  Post, Query,
  Render,
  Req,
  Res,
  Session
} from '@nestjs/common'
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
    @Session() session: any
  ) {
    const createdParty = await this.partyService.create(partyName)
    return res.redirect('/sign-up/complete?spaceId=' + createdParty.spaceId)
  }

  @Get('/complete')
  @Render('sign-up/complete')
  complete(@Req() req: Request,
           @Query() query: { spaceId: string }) {
    const spaceUrl = req.protocol + '://' + req.get('host') + '/calendar?spaceId=' + query.spaceId

    return {
      title: 'パーティー作成完了',
      spaceId: query.spaceId,
      spaceUrl: spaceUrl
    }
  }
}
