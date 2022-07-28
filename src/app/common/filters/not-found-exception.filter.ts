import {ArgumentsHost, Catch, ExceptionFilter, NotFoundException} from '@nestjs/common'
import {Response} from 'express'

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const httpArgumentsHost = host.switchToHttp()
    const response = httpArgumentsHost.getResponse<Response>()

    return response.render('404', {title: '404 Page Not Found'})
  }
}
