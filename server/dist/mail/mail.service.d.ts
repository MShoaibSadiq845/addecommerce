import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly configService;
    private resend;
    private readonly logger;
    constructor(configService: ConfigService);
    sendOrderConfirmationEmail(userEmail: string, orderDetails: any): Promise<any>;
}
