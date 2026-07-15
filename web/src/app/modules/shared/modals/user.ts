export interface User {
    status: string;
    userCode: string;
    retailerId: string;

    cmpCode: string;
    loginCode: string;
    password: string;
    userName: string;
    userType: string;
    userTypeValue: string;
    mappedCode: string;
    isLastLevel: boolean;
    hierLevel: string;
    lastHierLevel: string;
    loginStatus: boolean;
    newPassword: string;
    message: string;
    token: string;
    enableCompress: boolean;
    appVersion: string;
    systemDate: string;
}
export interface DocumentModel {
    documentId: string;
    documentName: string;
    documentFor:string;
    documentData: string;
    documentType: string;
    uploadedOn?: Date;
    isDeleted: boolean;
    actionBy: string;
    mode?: string;
    retailerId:string;
}