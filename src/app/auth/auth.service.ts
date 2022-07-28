import {Injectable} from '@nestjs/common'
import {PlayerService} from '../service/player.service'

@Injectable()
export class AuthService {
  constructor(private playerService: PlayerService) {
  }

  async validatePlayer(playerId: number, password: string): Promise<any> {
    const player = await this.playerService.findByCharacterId(playerId)

    if (!player) {
      return null
    }

    if (await player.validatePassword(password)) {
      const {password, ...result} = player
      return result
    }

    return null
  }

  async retrieveToken(playerId: number): Promise<any> {
    // TODO: access Lodestone and fetch token from "Character Profile"
  }
}
