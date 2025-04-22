import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateReversalDto } from './dto/create-reversal.dto';
import { TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(senderId: number, createTransactionDto: CreateTransactionDto) {
    const { amount, receiverId, description } = createTransactionDto;

    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });

    if (!sender) {
      throw new BadRequestException('Sender not found');
    }

    if (sender.balance.lessThan(amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.prisma.$transaction(async tx => {
      await tx.user.update({
        where: { id: senderId },
        data: { balance: { decrement: amount } },
      });

      await tx.user.update({
        where: { id: receiverId },
        data: { balance: { increment: amount } },
      });

      return tx.transaction.create({
        data: {
          amount,
          description,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
          senderId,
          receiverId,
        },
      });
    });
  }

  async createReversal(userId: number, createReversalDto: CreateReversalDto) {
    const { transactionId, reason } = createReversalDto;

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.REVERSED) {
      throw new BadRequestException('Transaction already reversed');
    }

    return this.prisma.$transaction(async tx => {
      await tx.user.update({
        where: { id: transaction.senderId },
        data: { balance: { increment: transaction.amount } },
      });

      await tx.user.update({
        where: { id: transaction.receiverId },
        data: { balance: { decrement: transaction.amount } },
      });

      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.REVERSED },
      });

      return tx.transactionReversal.create({
        data: {
          reason,
          transactionId,
        },
      });
    });
  }

  findAll(userId: number) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
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
  }

  findOne(id: number) {
    return this.prisma.transaction.findUnique({
      where: { id },
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
  }
}
