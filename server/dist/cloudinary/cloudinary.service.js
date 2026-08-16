"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
let CloudinaryService = class CloudinaryService {
    async uploadFile(file) {
        console.log('CloudinaryService.uploadFile called');
        if (!file || !file.buffer) {
            console.error('Invalid file upload - missing file or buffer');
            throw new common_1.BadRequestException('Invalid file upload');
        }
        console.log('Creating upload stream to Cloudinary...');
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: 'ecommerce_products',
                resource_type: 'auto',
            }, (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(new common_1.InternalServerErrorException(`Failed to upload image: ${error.message}`));
                }
                if (!result) {
                    console.error('Cloudinary upload returned undefined result');
                    return reject(new common_1.InternalServerErrorException('Cloudinary upload returned undefined result'));
                }
                console.log('Cloudinary upload completed successfully');
                resolve(result);
            });
            console.log('Piping file buffer to Cloudinary...');
            const readableStream = stream_1.Readable.from(file.buffer);
            readableStream.pipe(uploadStream);
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)()
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map