import { UserRole } from '../../users/schemas/user.schema';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    /**
     * Role is OPTIONAL in the DTO body but the controller enforces
     * that only an already-authenticated Super Admin may assign Admin/Super Admin.
     * Default is 'User' when not provided.
     */
    role?: UserRole;
    avatar?: string;
}
