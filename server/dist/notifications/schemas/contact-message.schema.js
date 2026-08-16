var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
let ContactMessage = class ContactMessage {
    name;
    email;
    subject;
    message;
    isRead;
};
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], ContactMessage.prototype, "name", void 0);
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], ContactMessage.prototype, "email", void 0);
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], ContactMessage.prototype, "subject", void 0);
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], ContactMessage.prototype, "message", void 0);
__decorate([
    Prop({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], ContactMessage.prototype, "isRead", void 0);
ContactMessage = __decorate([
    Schema({ timestamps: true })
], ContactMessage);
export { ContactMessage };
export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);
//# sourceMappingURL=contact-message.schema.js.map