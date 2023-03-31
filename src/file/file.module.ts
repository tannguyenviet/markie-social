import { Module } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  controllers: [FileController],
  providers: [
    FileService,
    {
      provide: 'CLOUDINARY',
      useValue: cloudinary.config({
        cloud_name: 'napa',
        api_key: '456987645682127',
        api_secret: 'o7aMJLMxbGrP63dv7H8HaydhRT8',
      }),
    },
  ],
})
export class FileModule {}
