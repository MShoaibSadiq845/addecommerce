declare const _default: (() => {
    uri: string;
    dbName: string;
    connectionOptions: {
        family: number;
        serverSelectionTimeoutMS: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    uri: string;
    dbName: string;
    connectionOptions: {
        family: number;
        serverSelectionTimeoutMS: number;
    };
}>;
export default _default;
