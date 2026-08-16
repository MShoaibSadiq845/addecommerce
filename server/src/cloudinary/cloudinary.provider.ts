import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CLOUDINARY = 'Cloudinary';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = config.get<string>('CLOUDINARY_API_SECRET');

    console.log('Initializing Cloudinary with:', {
      cloud_name: cloudName,
      api_key: apiKey ? `${apiKey.slice(0, 4)}***` : 'missing',
      api_secret: apiSecret ? '***' : 'missing',
    });

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary environment variables are not configured');
    }

    const result = cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    console.log('Cloudinary configured successfully');
    return result;
  },
};
