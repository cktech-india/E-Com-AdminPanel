export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;

    userId: string;
    firstName: string;
    lastName: string;
    phone: string;
    token: string;
    groupCode: string;
    screenList: any[];
    isPasswordForceChange: boolean,
    userImage: string;
    loginMessage: string;
    loginStatus: string;
    currentAttemptCount: number;
    otherMessage: string;
}
