import 'express';
import { User } from '../users/user.entity';

declare module 'express' {
  export interface Request {
    currentUser?: User;
  }
}
