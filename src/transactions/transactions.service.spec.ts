import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionStatus, TransactionType, ReversalStatus } from '@prisma/client';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let mockPrismaService: any;

  beforeAll(() => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      transactionReversal: {
        create: jest.fn(),
      },
      $transaction: jest.fn(callback => callback(mockPrismaService)),
    };
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTransactionDto = {
      amount: 100,
      receiverId: 2,
      description: 'Test transfer',
    };

    const sender = {
      id: 1,
      email: 'sender@test.com',
      balance: new Decimal(500),
    };

    it('should create a transaction successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(sender);
      mockPrismaService.transaction.create.mockResolvedValueOnce({
        id: 1,
        ...createTransactionDto,
        senderId: 1,
        status: TransactionStatus.COMPLETED,
        type: TransactionType.TRANSFER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(1, createTransactionDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.transaction.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when sender has insufficient balance', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        ...sender,
        balance: new Decimal(50),
      });

      await expect(service.create(1, createTransactionDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createReversal', () => {
    const createReversalDto = {
      transactionId: 1,
      reason: 'Wrong transfer',
    };

    const transaction = {
      id: 1,
      senderId: 1,
      receiverId: 2,
      amount: new Decimal(100),
      status: TransactionStatus.COMPLETED,
      type: TransactionType.TRANSFER,
    };

    it('should create a reversal successfully', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValueOnce(transaction);
      mockPrismaService.transactionReversal.create.mockResolvedValueOnce({
        id: 1,
        ...createReversalDto,
        status: ReversalStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createReversal(1, createReversalDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.transaction.update).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.transactionReversal.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when transaction is already reversed', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValueOnce({
        ...transaction,
        status: TransactionStatus.REVERSED,
      });

      await expect(service.createReversal(1, createReversalDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all transactions for a user', async () => {
      const transactions = [
        {
          id: 1,
          senderId: 1,
          receiverId: 2,
          amount: new Decimal(100),
          status: TransactionStatus.COMPLETED,
          type: TransactionType.TRANSFER,
        },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValueOnce(transactions);

      const result = await service.findAll(1);

      expect(result).toEqual(transactions);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ senderId: 1 }, { receiverId: 1 }],
        },
        include: {
          sender: {
            select: { id: true, email: true },
          },
          receiver: {
            select: { id: true, email: true },
          },
          reversalTransaction: true,
        },
      });
    });
  });
});
