import {Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Query, Render, Req, Res} from '@nestjs/common'
import {PartyService} from '../service/party.service'
import {Response, Request} from 'express'
import {RoleService} from '../service/role.service'
import {PositionService} from '../service/position.service'
import {PlayerService} from '../service/player.service'

@Controller('admin/party')
export class PartyController {
  constructor(
    private readonly partyService: PartyService,
  ) {
  }

  @Get('')
  @Render('admin/party/edit')
  async edit(@Req() req: Request, @Res() res: Response, @Query() query: { partyId: string }) {
    const party = await this.partyService.findByUlid(query.partyId)

    if (!party) {
      return res.redirect('/404')
    }

    return {
      title: 'パーティー設定',
      party: party,
      csrfToken: req.csrfToken(),
    }
  }

  @Post('')
  async update(
    @Res() res: Response,
    @Body('partyName') partyName: string,
    @Query() query: { partyId: string },
  ) {
    const party = await this.partyService.findByUlid(query.partyId)

    if (!party) {
      return res.redirect('/404')
    }

    await this.partyService.update(party.id, partyName)

    return res.redirect('/admin/party?partyId=' + party.ulid)
  }

  @Post('/delete')
  async delete(@Req() req: Request, @Res() res: Response, @Query() query: { partyId: string }) {
    const party = await this.partyService.findByUlid(query.partyId)

    if (!party) {
      return res.redirect('/404')
    }

    await this.partyService.delete(party)

    return res.redirect('/')
  }
}
