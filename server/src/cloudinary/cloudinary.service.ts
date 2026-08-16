import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    console.log('CloudinaryService.uploadFile called');
    
    if (!file || !file.buffer) {
      console.error('Invalid file upload - missing file or buffer');
      throw new BadRequestException('Invalid file upload');
    }

    console.log('Creating upload stream to Cloudinary...');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ecommerce_products',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new InternalServerErrorException(`Failed to upload image: ${error.message}`));
          }
          if (!result) {
            console.error('Cloudinary upload returned undefined result');
            return reject(new InternalServerErrorException('Cloudinary upload returned undefined result'));
          }
          console.log('Cloudinary upload completed successfully');
          resolve(result);
        }
      );

      console.log('Piping file buffer to Cloudinary...');
      const readableStream = Readable.from(file.buffer);
      readableStream.pipe(uploadStream);
    });
  }
}
