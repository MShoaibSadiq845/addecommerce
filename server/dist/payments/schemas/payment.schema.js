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
import { Types } from 'mongoose';
let Payment = class Payment {
    carId;
    buyerId;
    amount;
    lotNumber;
    winDate;
    shippingStatus;
    transactionId;
};
__decorate([
    Prop({ type: Types.ObjectId, ref: 'Car', required: true }),
    __metadata("design:type", Types.ObjectId)
], Payment.prototype, "carId", void 0);
__decorate([
    Prop({ type: Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", Types.ObjectId)
], Payment.prototype, "buyerId", void 0);
__decorate([
    Prop({ type: Number, required: true }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], Payment.prototype, "lotNumber", void 0);
__decorate([
    Prop({ type: Date, required: true }),
    __metadata("design:type", Date)
], Payment.prototype, "winDate", void 0);
__decorate([
    Prop({ type: String, default: 'ready_for_shipping', enum: ['ready_for_shipping', 'in_transit', 'delivered'] }),
    __metadata("design:type", String)
], Payment.prototype, "shippingStatus", void 0);
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], Payment.prototype, "transactionId", void 0);
Payment = __decorate([
    Schema({ timestamps: true })
], Payment);
export { Payment };
export const PaymentSchema = SchemaFactory.createForClass(Payment);
//# sourceMappingURL=payment.schema.js.map