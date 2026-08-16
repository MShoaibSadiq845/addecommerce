"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactMessageSchema = exports.ContactMessage = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ContactMessage = class ContactMessage {
};
exports.ContactMessage = ContactMessage;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], ContactMessage.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], ContactMessage.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], ContactMessage.prototype, "subject", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], ContactMessage.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], ContactMessage.prototype, "isRead", void 0);
exports.ContactMessage = ContactMessage = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ContactMessage);
exports.ContactMessageSchema = mongoose_1.SchemaFactory.createForClass(ContactMessage);
//# sourceMappingURL=contact-message.schema.js.map