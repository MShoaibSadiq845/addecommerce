import { Document } from 'mongoose';
export type ContactMessageDocument = ContactMessage & Document;
export declare class ContactMessage {
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
}
export declare const ContactMessageSchema: import("mongoose").Schema<ContactMessage, import("mongoose").Model<ContactMessage, any, any, any, any, any, ContactMessage>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ContactMessage, Document<unknown, {}, ContactMessage, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ContactMessage & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, ContactMessage, Document<unknown, {}, ContactMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    email?: import("mongoose").SchemaDefinitionProperty<string, ContactMessage, Document<unknown, {}, ContactMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    subject?: import("mongoose").SchemaDefinitionProperty<string, ContactMessage, Document<unknown, {}, ContactMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    message?: import("mongoose").SchemaDefinitionProperty<string, ContactMessage, Document<unknown, {}, ContactMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    isRead?: import("mongoose").SchemaDefinitionProperty<boolean, ContactMessage, Document<unknown, {}, ContactMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, ContactMessage>;
