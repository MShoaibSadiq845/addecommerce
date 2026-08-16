var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
let CloudinaryService = class CloudinaryService {
    async uploadFile(file) {
        console.log('CloudinaryService.uploadFile called');
        if (!file || !file.buffer) {
            console.error('Invalid file upload - missing file or buffer');
            throw new BadRequestException('Invalid file upload');
        }
        console.log('Creating upload stream to Cloudinary...');
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: 'ecommerce_products',
                resource_type: 'auto',
            }, (error, result) => {
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
            });
            console.log('Piping file buffer to Cloudinary...');
            const readableStream = Readable.from(file.buffer);
            readableStream.pipe(uploadStream);
        });
    }
};
CloudinaryService = __decorate([
    Injectable()
], CloudinaryService);
export { CloudinaryService };
//# sourceMappingURL=cloudinary.service.js.map