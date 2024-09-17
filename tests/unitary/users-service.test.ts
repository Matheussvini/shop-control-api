import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { userRepository } from '@/repositories';
import { userService } from '@/services';
import { conflictError, invalidCredentialsError, notFoundError } from '@/errors';

jest.mock('@/repositories', () => {
  return {
    userRepository: {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      count: jest.fn(),
    },
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken');
jest.mock('nodemailer');

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('confirmEmail', () => {
    it('should confirm email and create a new user using a token', async () => {
      const mockToken = 'validToken';
      const mockUserData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        type: 'user',
      };

      // Mockando a decodificação do token
      (jwt.verify as jest.Mock).mockReturnValue(mockUserData);

      // Mockando a validação de email único
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      // Mockando a criação do novo usuário
      (userRepository.create as jest.Mock).mockResolvedValue(mockUserData);

      await userService.confirmEmail(mockToken);

      // Verifica se o token foi verificado corretamente
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);

      // Verifica se a função de criar usuário foi chamada com os dados corretos
      expect(userRepository.create).toHaveBeenCalledWith({
        username: mockUserData.username,
        email: mockUserData.email,
        password: mockUserData.password,
        type: mockUserData.type,
      });
    });

    it('should throw an error if the token is invalid', async () => {
      const mockToken = 'invalidToken';

      // Simulando erro ao verificar o token
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Authentication token invalid');
      });

      try {
        await userService.confirmEmail(mockToken);
      } catch (error) {
        expect(error.message).toBe('Authentication token invalid');
      }

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a user and send a confirmation email', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';
      const mockHashedPassword = 'hashedPassword';
      const mockToken = 'jwtToken';

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      const mockSendMail = jest.fn().mockResolvedValue(true);
      (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: mockSendMail });

      await userService.create({ username: 'testuser', email: mockEmail, password: mockPassword });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockEmail);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 12);
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalled();
    });

    it('should throw a conflict error if email already exists', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });

      try {
        await userService.create({ username: 'testuser', email: 'test@example.com', password: 'password123' });
      } catch (error) {
        expect(error).toMatchObject(conflictError('Email already exists'));
      }
    });
  });

  describe('login', () => {
    it('should log in a user and return a token', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
      const mockToken = 'jwtToken';

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await userService.login({ email: 'test@example.com', password: 'password123' });

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('token', mockToken);
    });

    it('should throw an error if email is invalid', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      try {
        await userService.login({ email: 'invalid@example.com', password: 'password123' });
      } catch (error) {
        expect(error).toMatchObject(invalidCredentialsError('Invalid email or password'));
      }
    });

    it('should throw an error if password is invalid', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword' };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      try {
        await userService.login({ email: 'test@example.com', password: 'wrongpassword' });
      } catch (error) {
        expect(error).toMatchObject(invalidCredentialsError('Invalid email or password'));
      }
    });
  });

  describe('getAll', () => {
    it('should return all users with pagination', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com', type: 'admin' },
        { id: 2, username: 'user2', email: 'user2@example.com', type: 'user' },
      ];

      const mockParams = { page: 1, limit: 10, username: '', email: '', type: '' };

      // Mockando `findMany` para retornar apenas os usuários
      (userRepository.findMany as jest.Mock).mockResolvedValue(mockUsers);

      // Mockando a contagem total de usuários
      (userRepository.count as jest.Mock).mockResolvedValue(2);

      const result = await userService.getAll(mockParams);

      expect(userRepository.findMany).toHaveBeenCalledWith({
        skip: 0, // (page - 1) * limit
        take: 10,
        where: {},
      });

      expect(userRepository.count).toHaveBeenCalledWith({});

      // Verifica o resultado da função
      expect(result).toEqual({
        data: mockUsers,
        total: 2,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getById', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getById(1);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw not found error if user does not exist', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      try {
        await userService.getById(1);
      } catch (error) {
        expect(error).toMatchObject(notFoundError('User not found'));
      }

      expect(userRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', type: 'user' };
      const updatedUser = { id: 1, username: 'updatedUser', email: 'newemail@example.com', type: 'admin' };

      // Mockando o usuário existente
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      // Evitando a validação de email duplicado
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      // Mockando a atualização de usuário
      (userRepository.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.update(1, {
        username: 'updatedUser',
        email: 'newemail@example.com',
        type: 'admin',
      });

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('newemail@example.com');
      expect(userRepository.update).toHaveBeenCalledWith(1, {
        username: 'updatedUser',
        email: 'newemail@example.com',
        type: 'admin',
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error if the user is already of this type', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', type: 'admin' };

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      try {
        await userService.update(1, { username: 'testuser', email: 'test@example.com', type: 'admin' });
      } catch (error) {
        expect(error.message).toBe('User is already of this type');
      }

      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteById', () => {
    it('should delete a user successfully', async () => {
      (userRepository.deleteById as jest.Mock).mockResolvedValue(null);

      await userService.deleteById(1);

      expect(userRepository.deleteById).toHaveBeenCalledWith(1);
    });

    it('should throw not found error if user does not exist', async () => {
      // Simulamos que o método `deleteById` lança um erro quando o usuário não é encontrado
      (userRepository.deleteById as jest.Mock).mockImplementation(() => {
        throw notFoundError('User not found');
      });

      try {
        await userService.deleteById(1);
      } catch (error) {
        expect(error).toMatchObject(notFoundError('User not found'));
      }

      expect(userRepository.deleteById).toHaveBeenCalledWith(1);
    });
  });

  describe('changePassword', () => {
    it('should change the password successfully', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', password: 'oldHashedPassword' };
      const mockNewHashedPassword = 'newHashedPassword';

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockNewHashedPassword);
      (userRepository.update as jest.Mock).mockResolvedValue({ ...mockUser, password: mockNewHashedPassword });

      await userService.changePassword(1, 1, 'oldPassword', 'newPassword');

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', 'oldHashedPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 12);
      expect(userRepository.update).toHaveBeenCalledWith(1, { password: mockNewHashedPassword });
    });

    it('should throw invalid credentials error if old password does not match', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', password: 'oldHashedPassword' };

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      try {
        await userService.changePassword(1, 1, 'wrongOldPassword', 'newPassword');
      } catch (error) {
        expect(error).toMatchObject(invalidCredentialsError('Invalid password'));
      }
    });

    it('should throw not found error if user does not exist', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      try {
        await userService.changePassword(1, 1, 'oldPassword', 'newPassword');
      } catch (error) {
        expect(error).toMatchObject(notFoundError('User not found'));
      }
    });
  });
});
