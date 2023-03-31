import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const now = Date.now();
    // console.log('........................Request.......................');
    return next.handle().pipe(
      catchError((err) => {
        // console.log(
        //   '........................Response (Error).......................',
        // );
        // console.log('BODYYY', {
        //   req: request,
        //   res: {
        //     headers: response.getHeaders(),
        //     status: response.statusCode,
        //     data: err.response.body,
        //   },
        // });
        // console.log(
        //   '........................Response (Error).......................',
        // );
        throw err;
      }),
      map((data) => {
        // console.log('........................Response.......................');
        // console.log('BODYYY', {
        //   req: request,
        //   res: {
        //     headers: response.getHeaders(),
        //     status: response.statusCode,
        //     data: data,
        //   },
        // });
        // console.log('........................Response.......................');
        return data;
      }),
      tap(() => {
        console.log(`After... ${Date.now() - now}ms`);
      }),
    );
  }
}
