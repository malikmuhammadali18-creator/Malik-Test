import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const hash = await bcrypt.hash('correctpassword', 10);
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        passwordHash: hash,
        role: 'Student',
        firstName: 'John',
        lastName: 'Doe',
      });

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access_token on valid credentials', async () => {
      const hash = await bcrypt.hash('correctpassword', 10);
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        passwordHash: hash,
        role: 'Student',
        firstName: 'John',
        lastName: 'Doe',
      });

      const result = await authService.login({
        email: 'test@test.com',
        password: 'correctpassword',
      });

      expect(result.access_token).toBe('mock-jwt-token');
    });
  });
});
