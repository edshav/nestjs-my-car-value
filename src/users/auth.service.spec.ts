import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('aasdaf@afsf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user sign ups with email that is in use', async () => {
    await service.signup('test@demo.com', 'prinks');

    await expect(async () => {
      await service.signup('test@demo.com', 'prinks');
    }).rejects.toThrow('email in use');
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(async () => {
      await service.signin('test@demo.com', 'prinks');
    }).rejects.toThrow('user not found');
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('test@demo.com', 'password');
    await expect(async () => {
      await service.signin('test@demo.com', 'w');
    }).rejects.toThrow('bad password');
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('test@demo.com', 'mypassword');
    const user = await service.signin('test@demo.com', 'mypassword');
    expect(user).toBeDefined();
  });
});
