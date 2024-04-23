import { Dayjs } from 'dayjs';

type JWTUser = {
  username: string;
  firstName: string;
  role: string;
  lastName: string;
  iat: number;
  exp: number;
};

export type SessionBearer = {
  token: string;
  createdAt: Dayjs;
};
