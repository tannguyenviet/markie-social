import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as UUID } from 'uuid';
@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    console.log(exception.getResponse());
    const resException = exception.getResponse();

    if (resException.hasOwnProperty(''))
      response.status(status).json({
        // traceId: UUID(),
        statusCode: status,
        timestamp: new Date().toISOString(),
      });
  }
}
