export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role | string;
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
