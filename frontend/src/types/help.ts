import { IUser } from "./user";

export enum HelpStatusEnum {
  SUBMITTED = 'submitted',
  RESOLVED = 'resolved'
}

export interface IHelpMessage {
  role: 'user' | 'admin';
  content: string;
  createdAt: string;
}

export interface IHelp {
  _id: string;
  user_id: string | IUser;
  subject: string;
  body: string;
  status: HelpStatusEnum;
  messages: IHelpMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateHelpData {
  subject: string;
  body: string;
}

export interface ReplyHelpData {
  content: string;
}
