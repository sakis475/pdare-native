import { User } from './basic.types';

export type JWTUser = {
  username: string;
  firstName: string;
  role: string;
  lastName: string;
  iat: number;
  exp: number;
};

export type SessionBearer = {
  token: string;
  info: { expiresAt: string };
  user: User;
};
