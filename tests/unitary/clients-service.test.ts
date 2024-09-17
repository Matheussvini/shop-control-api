import { Prisma } from '@prisma/client';
import { clientService } from '@/services/clients-service';
import { conflictError, notFoundError } from '@/errors';
import { clientRepository, userRepository } from '@/repositories';
import { CreateClientInput } from '@/schemas';

jest.mock('@/repositories', () => {
  return {
    clientRepository: {
      createClientWithAddress: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      findByUserId: jest.fn(),
    },
    userRepository: {
      findById: jest.fn(),
    },
  };
});

describe('clients-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Client Service', () => {
    const mockClient = { id: 1, fullName: 'John Doe', contact: '123456789', status: true };
    const mockUser = { id: 1, name: 'Jane Doe' };
    const mockClientInput: CreateClientInput = {
      userId: 1,
      fullName: 'John Doe',
      contact: '123456789',
      address: {
        clientId: 1,
        cep: '12345678',
        logradouro: '123 Street',
        numero: '123',
        complemento: 'apto 123',
        bairro: 'brookyln',
        cidade: 'Bonsucesso',
        estado: 'SP',
        status: true,
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('create', () => {
      it('should create a new client', async () => {
        (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
        (clientRepository.findByUserId as jest.Mock).mockResolvedValue(null);
        (clientRepository.createClientWithAddress as jest.Mock).mockResolvedValue(mockClient);

        const result = await clientService.create(mockClientInput);

        expect(result).toEqual(mockClient);
        expect(userRepository.findById).toHaveBeenCalledWith(1);
        expect(clientRepository.findByUserId).toHaveBeenCalledWith(1);
        expect(clientRepository.createClientWithAddress).toHaveBeenCalledWith(mockClientInput);
      });

      it('should throw conflict error if client already exists', async () => {
        (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
        (clientRepository.findByUserId as jest.Mock).mockResolvedValue(mockClient);

        try {
          await clientService.create(mockClientInput);
        } catch (error) {
          expect(error).toEqual(conflictError('Client already exists for this user'));
        }
      });

      it('should throw not found error if user does not exist', async () => {
        (userRepository.findById as jest.Mock).mockResolvedValue(null);

        try {
          await clientService.create(mockClientInput);
        } catch (error) {
          expect(error).toEqual(notFoundError('User not found'));
        }
      });
    });

    describe('getAll', () => {
      it('should return paginated clients', async () => {
        const params = { page: 1, limit: 10, fullName: 'John', contact: '123', status: true };
        const clients = [mockClient];
        const total = 1;

        (clientRepository.findMany as jest.Mock).mockResolvedValue(clients);
        (clientRepository.count as jest.Mock).mockResolvedValue(total);

        const result = await clientService.getAll(params);

        expect(result).toEqual({ data: clients, total, page: 1, limit: 10 });
        expect(clientRepository.findMany).toHaveBeenCalledWith({
          skip: 0,
          take: 10,
          where: { fullName: { contains: 'John', mode: 'insensitive' }, contact: { contains: '123' }, status: true },
        });
        expect(clientRepository.count).toHaveBeenCalledWith({
          fullName: { contains: 'John', mode: 'insensitive' },
          contact: { contains: '123' },
          status: true,
        });
      });
    });

    describe('getById', () => {
      it('should return a client by id', async () => {
        (clientRepository.findById as jest.Mock).mockResolvedValue(mockClient);

        const result = await clientService.getById(1);

        expect(result).toEqual(mockClient);
        expect(clientRepository.findById).toHaveBeenCalledWith(1);
      });

      it('should throw not found error if client does not exist', async () => {
        (clientRepository.findById as jest.Mock).mockResolvedValue(null);

        try {
          await clientService.getById(1);
        } catch (error) {
          expect(error).toEqual(notFoundError('Client not found'));
        }
      });
    });

    describe('update', () => {
      it('should update a client', async () => {
        const updateData: Prisma.ClientUpdateInput = { fullName: 'John Updated' };

        (clientRepository.findById as jest.Mock).mockResolvedValue(mockClient);
        (clientRepository.update as jest.Mock).mockResolvedValue({ ...mockClient, ...updateData });

        const result = await clientService.update(1, updateData);

        expect(result).toEqual({ ...mockClient, ...updateData });
        expect(clientRepository.findById).toHaveBeenCalledWith(1); // Ensure that findById is called
        expect(clientRepository.update).toHaveBeenCalledWith(1, updateData);
      });

      it('should throw not found error if client does not exist', async () => {
        (clientRepository.findById as jest.Mock).mockResolvedValue(null);

        try {
          const updateData: Prisma.ClientUpdateInput = { fullName: 'John Updated' };
          await clientService.update(1, updateData);
        } catch (error) {
          expect(error).toEqual(notFoundError('Client not found'));
        }
      });
    });

    describe('deleteById', () => {
      it('should delete a client by id', async () => {
        (clientRepository.findById as jest.Mock).mockResolvedValue(mockClient);
        (clientRepository.deleteById as jest.Mock).mockResolvedValue(mockClient);

        const result = await clientService.deleteById(1);

        expect(result).toEqual(mockClient);
        expect(clientRepository.findById).toHaveBeenCalledWith(1); // Ensure that findById is called
        expect(clientRepository.deleteById).toHaveBeenCalledWith(1);
      });

      it('should throw not found error if client does not exist', async () => {
        (clientRepository.findById as jest.Mock).mockResolvedValue(null);

        try {
          await clientService.deleteById(1);
        } catch (error) {
          expect(error).toEqual(notFoundError('Client not found'));
        }
      });
    });
  });
});
