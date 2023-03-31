import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FileService {
  async upload(file: any): Promise<{ url: string }> {
    const uploadResult = await cloudinary.uploader.upload(file.path);

    return {
      url: uploadResult.url,
    };
  }

  async presignUrl(filename: string): Promise<{ url: string }> {
    const uploadOptions = {
      public_id: filename,
      resource_type: 'auto',
      type: 'upload',
      sign_url: true,
      secure: true,
      transformation: { width: 500, height: 500, crop: 'limit' },
    };

    const signedUrl = cloudinary.url(filename, uploadOptions);

    return {
      url: signedUrl,
    };
  }
}
