"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryProvider = exports.CLOUDINARY = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = require("@nestjs/config");
exports.CLOUDINARY = 'Cloudinary';
exports.CloudinaryProvider = {
    provide: exports.CLOUDINARY,
    inject: [config_1.ConfigService],
    useFactory: (config) => {
        const cloudName = config.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = config.get('CLOUDINARY_API_KEY');
        const apiSecret = config.get('CLOUDINARY_API_SECRET');
        console.log('Initializing Cloudinary with:', {
            cloud_name: cloudName,
            api_key: apiKey ? `${apiKey.slice(0, 4)}***` : 'missing',
            api_secret: apiSecret ? '***' : 'missing',
        });
        if (!cloudName || !apiKey || !apiSecret) {
            throw new Error('Cloudinary environment variables are not configured');
        }
        const result = cloudinary_1.v2.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });
        console.log('Cloudinary configured successfully');
        return result;
    },
};
//# sourceMappingURL=cloudinary.provider.js.map