export interface ResponseModel {
    status: number;
    message: string;
    otherMessages: any;
}

export enum RecordMode {
  Create = 'C',
  Delete = 'D',
  Edit = 'E',
  View = 'V'
}