import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: any): Promise<{ url: string }> {
    return await this.fileService.upload(file);
  }

  @Post('presign-url')
  async presignUrl(
    @Body('filename') filename: string,
  ): Promise<{ url: string }> {
    return await this.fileService.presignUrl(filename);
  }
}
