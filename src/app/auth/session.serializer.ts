import {PassportSerializer} from '@nestjs/passport'
import {Injectable} from '@nestjs/common'

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(player: any, done: (err: Error, player: any) => void): any {
    done(null, player)
  }

  deserializeUser(payload: any, done: (err: Error, payload: string) => void): any {
    done(null, payload)
  }
}
