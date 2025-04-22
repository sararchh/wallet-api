import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateReversalDto } from './dto/create-reversal.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('api/transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    try {
      return await this.transactionsService.create(
        Number(req.user.userId),
        createTransactionDto,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('reversal')
  @ApiOperation({ summary: 'Create a transaction reversal' })
  @ApiResponse({ status: 201, description: 'Reversal created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createReversal(@Request() req, @Body() createReversalDto: CreateReversalDto) {
    try {
      return await this.transactionsService.createReversal(
        Number(req.user.userId),
        createReversalDto,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns all transactions' })
  async findAll(@Request() req) {
    try {
      return await this.transactionsService.findAll(Number(req.user.userId));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200, description: 'Returns the transaction' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string) {
    try {
      const transaction = await this.transactionsService.findOne(+id);
      if (!transaction) {
        throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
      }
      return transaction;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
