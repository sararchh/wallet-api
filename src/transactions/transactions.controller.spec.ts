import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { HttpException } from '@nestjs/common';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockTransactionsService = {
    create: jest.fn(),
    createReversal: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
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

    const mockRequest = {
      user: {
        userId: 1,
      },
    };

    it('should create a transaction successfully', async () => {
      const expectedResult = {
        id: 1,
        ...createTransactionDto,
        senderId: 1,
        status: TransactionStatus.COMPLETED,
        type: TransactionType.TRANSFER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTransactionsService.create.mockResolvedValueOnce(expectedResult);

      const result = await controller.create(mockRequest, createTransactionDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(1, createTransactionDto);
    });

    it('should handle errors during transaction creation', async () => {
      mockTransactionsService.create.mockRejectedValueOnce(
        new Error('Insufficient balance'),
      );

      await expect(controller.create(mockRequest, createTransactionDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('createReversal', () => {
    const createReversalDto = {
      transactionId: 1,
      reason: 'Wrong transfer',
    };

    const mockRequest = {
      user: {
        userId: 1,
      },
    };

    it('should create a reversal successfully', async () => {
      const expectedResult = {
        id: 1,
        ...createReversalDto,
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTransactionsService.createReversal.mockResolvedValueOnce(expectedResult);

      const result = await controller.createReversal(mockRequest, createReversalDto);

      expect(result).toEqual(expectedResult);
      expect(service.createReversal).toHaveBeenCalledWith(1, createReversalDto);
    });

    it('should handle errors during reversal creation', async () => {
      mockTransactionsService.createReversal.mockRejectedValueOnce(
        new Error('Transaction already reversed'),
      );

      await expect(
        controller.createReversal(mockRequest, createReversalDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    const mockRequest = {
      user: {
        userId: 1,
      },
    };

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

      mockTransactionsService.findAll.mockResolvedValueOnce(transactions);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(transactions);
      expect(service.findAll).toHaveBeenCalledWith(1);
    });

    it('should handle errors when finding transactions', async () => {
      mockTransactionsService.findAll.mockRejectedValueOnce(new Error('Database error'));

      await expect(controller.findAll(mockRequest)).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return a transaction by ID', async () => {
      const transaction = {
        id: 1,
        senderId: 1,
        receiverId: 2,
        amount: new Decimal(100),
        status: TransactionStatus.COMPLETED,
        type: TransactionType.TRANSFER,
      };

      mockTransactionsService.findOne.mockResolvedValueOnce(transaction);

      const result = await controller.findOne('1');

      expect(result).toEqual(transaction);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when transaction is not found', async () => {
      mockTransactionsService.findOne.mockResolvedValueOnce(null);

      await expect(controller.findOne('1')).rejects.toThrow(HttpException);
    });
  });
});
