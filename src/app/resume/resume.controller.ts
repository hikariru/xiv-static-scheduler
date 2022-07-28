import {Body, Controller, Get, Param, Post, Req, Res, Session} from '@nestjs/common'
import {Request, Response} from 'express'
import {RoleService} from '../service/role.service'
import {DatacenterService} from '../service/datacenter.service'
import {RaidService} from '../service/raid.service'
import {CreateResumeService} from './create-resume.service'

@Controller('resume')
export class ResumeController {
  constructor(
    private readonly jobService: RoleService,
    private readonly datacenterService: DatacenterService,
    private readonly raidService: RaidService,
    private readonly createResumeService: CreateResumeService,
  ) {
  }

  @Get('create')
  async create(@Req() req: Request, @Res() res: Response, @Session() session: Record<string, any>) {
    const characterId = session.characterId || 13821953 // Yoshi'p Sampo
    if (!characterId) {
      res.redirect('/')
      return
    }

    const datacenters = await this.datacenterService.findAll()
    const roles = await this.jobService.findAll()
    const raids = await this.raidService.findAll()

    return res.render('resume/create', {
      title: 'Create!',
      datacenters: datacenters,
      roles: roles,
      raids: raids,
      characterId: characterId,
      csrfToken: req.csrfToken(),
    })
  }

  @Post('create')
  async createSave(
    @Res() res: Response,
    @Body('first-name') firstName: string,
    @Body('last-name') lastName: string,
    @Body('character-id') characterId: string,
    @Body('world-id') worldId: string,
    @Body('password') password: string,
    @Body('job-id') jobId: string,
    @Body('twitter-id') twitterId: string,
    @Body('discord-id') discordId: string,
    @Body('active-time') activeTime: string,
    @Body('description') description: string,
    @Body('raid-progress') raidProgress: string[],
  ) {
    console.log(raidProgress)
    // const playerId = await this.createResumeService.create(
    //   firstName,
    //   lastName,
    //   characterId,
    //   worldId,
    //   password,
    //   jobId,
    //   twitterId,
    //   discordId,
    //   activeTime,
    //   description,
    //   raidProgress
    // )
    //
    // console.log(playerId)

    res.redirect('/')
  }
}
