import {Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Query, Render, Req, Res} from '@nestjs/common'
import {PartyService} from '../service/party.service'
import {Response, Request} from 'express'
import {RoleService} from '../service/role.service'
import {PositionService} from '../service/position.service'
import {PlayerService} from '../service/player.service'

@Controller('admin/member')
export class MemberController {
  constructor(
    private readonly partyService: PartyService,
    private readonly roleService: RoleService,
    private readonly positionService: PositionService,
    private readonly playerService: PlayerService,
  ) {
  }

  @Get()
  @Render('admin/member/list')
  async list(@Res() res: Response, @Query() query: { partyId: string }) {
    const party = await this.partyService.findByUlid(query.partyId)

    if (!party) {
      return res.redirect('/404')
    }

    const players = await this.playerService.findByPartyId(party.id)

    return {
      title: party.name + ' メンバー一覧',
      party: party,
      players: players,
    }
  }

  @Get('/add')
  @Render('admin/member/add')
  async add(@Req() req: Request, @Res() res: Response, @Query() query: { partyId: string }) {
    const party = await this.partyService.findByUlid(query.partyId)

    if (!party) {
      return res.redirect('/404')
    }

    const players = await this.playerService.findByPartyId(party.id)

    if (players.length >= 8) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
    }

    const roles = await this.roleService.findAll()
    const positions = await this.positionService.findAll()

    return {
      title: party.name + ' メンバー追加',
      party: party,
      roles: roles,
      positions: positions,
      csrfToken: req.csrfToken(),
    }
  }

  @Post('/add')
  async addToParty(
    @Res() res: Response,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('nickname') nickname: string,
    @Body('jobId') jobId: string,
    @Body('positionId') positionId: string,
    @Query() query: { partyId: string },
  ) {
    const party = await this.partyService.findByUlid(query.partyId)

    if (!party) {
      return res.redirect('/404')
    }

    const players = await this.playerService.findByPartyId(party.id)

    if (players.length >= 8) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
    }

    await this.playerService.add(firstName, lastName, nickname, Number(jobId), Number(positionId), party.id)

    return res.redirect('/admin/member?partyId=' + party.ulid)
  }

  @Get('/edit')
  @Render('admin/member/edit')
  async edit(@Req() req: Request, @Res() res: Response, @Query() query: { playerId: string }) {
    const player = await this.playerService.findByUlid(query.playerId)

    if (!player) {
      return res.redirect('/404')
    }

    const roles = await this.roleService.findAll()
    const positions = await this.positionService.findAll()

    return {
      title: player.party.name + ' メンバー編集',
      player: player,
      roles: roles,
      positions: positions,
      csrfToken: req.csrfToken(),
    }
  }

  @Post('/edit')
  async update(
    @Res() res: Response,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('nickname') nickname: string,
    @Body('jobId') jobId: string,
    @Body('positionId') positionId: string,
    @Query() query: { playerId: string },
  ) {
    const player = await this.playerService.findByUlid(query.playerId)

    if (!player) {
      return res.redirect('/404')
    }

    await this.playerService.update(player.id, firstName, lastName, nickname, Number(jobId), Number(positionId))

    return res.redirect('/admin/member?partyId=' + player.party.ulid)
  }

  @Post('/delete')
  async delete(@Req() req: Request, @Res() res: Response, @Query() query: { playerId: string }) {
    const player = await this.playerService.findByUlid(query.playerId)

    if (!player) {
      return res.redirect('/404')
    }

    await this.playerService.delete(player)

    return res.redirect('/admin/member?partyId=' + player.party.ulid)
  }
}
