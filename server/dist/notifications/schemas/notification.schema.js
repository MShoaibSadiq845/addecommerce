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
let Notification = class Notification {
    title;
    message;
    type;
    isRead;
    link;
};
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    Prop({ type: String, default: 'sale' }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    Prop({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    Prop({ type: String }),
    __metadata("design:type", String)
], Notification.prototype, "link", void 0);
Notification = __decorate([
    Schema({ timestamps: true })
], Notification);
export { Notification };
export const NotificationSchema = SchemaFactory.createForClass(Notification);
//# sourceMappingURL=notification.schema.js.map