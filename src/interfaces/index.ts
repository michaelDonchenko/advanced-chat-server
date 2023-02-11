declare global {
  namespace Express {
    export interface Request {
      user?: DecodedUser;
    }
  }
}

export interface DecodedUser {
  id: number;
  username: string;
}
