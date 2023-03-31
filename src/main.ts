import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './utils/http-exception.filter';
import { LoggingInterceptor } from './utils/logging-interceptor';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin: true,
    credentials: true,
  };
  app.enableCors(corsOptions);
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     // transformOptions: {
  //     //   enableImplicitConversion: true,
  //     // },
  //     // dismissDefaultMessages: true,
  //     // errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  //     // transform: true,
  //     // disableErrorMessages: true,
  //   }),
  // );
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  const port = process.env.PORT || 3002;
  // try {
  await app.listen(port);
  // } catch (err) {
  //   console.info(err);
  // }
}
bootstrap();
