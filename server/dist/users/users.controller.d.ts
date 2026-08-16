import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(): Promise<any>;
    getLoyaltyPoints(userId: string): Promise<any>;
    getUserById(id: string): Promise<any>;
}
