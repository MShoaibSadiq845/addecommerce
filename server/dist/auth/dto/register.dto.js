var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';
export class RegisterDto {
    name;
    email;
    password;
    /**
     * Role is OPTIONAL in the DTO body but the controller enforces
     * that only an already-authenticated Super Admin may assign Admin/Super Admin.
     * Default is 'User' when not provided.
     */
    role;
    avatar;
}
__decorate([
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    IsEmail({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    IsNotEmpty(),
    IsString(),
    MinLength(6, { message: 'Password must be at least 6 characters' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    IsOptional(),
    IsEnum(UserRole),
    __metadata("design:type", typeof (_a = typeof UserRole !== "undefined" && UserRole) === "function" ? _a : Object)
], RegisterDto.prototype, "role", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], RegisterDto.prototype, "avatar", void 0);
//# sourceMappingURL=register.dto.js.map