import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    USER = "User",
    ADMIN = "Admin",
    SUPER_ADMIN = "Super Admin"
}
export declare class User {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    loyaltyPoints: number;
    avatar: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, any, any, User>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, User, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, User, Document<unknown, {}, User, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    email?: import("mongoose").SchemaDefinitionProperty<string, User, Document<unknown, {}, User, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    password?: import("mongoose").SchemaDefinitionProperty<string, User, Document<unknown, {}, User, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    role?: import("mongoose").SchemaDefinitionProperty<UserRole, User, Document<unknown, {}, User, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    loyaltyPoints?: import("mongoose").SchemaDefinitionProperty<number, User, Document<unknown, {}, User, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    avatar?: import("mongoose").SchemaDefinitionProperty<string, User, Document<unknown, {}, User, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, User>;
