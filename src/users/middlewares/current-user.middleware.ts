import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private usersServise: UsersService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.session ?? {};

    if (userId) {
      const user = await this.usersServise.findOne(userId);
      req.currentUser = user;
    }

    next();
  }
}
