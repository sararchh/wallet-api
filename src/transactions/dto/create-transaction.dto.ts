import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 100.0, description: 'Amount to transfer' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 1, description: 'Receiver user ID' })
  @IsNumber()
  @IsNotEmpty()
  receiverId: number;

  @ApiProperty({
    example: 'Payment for services',
    description: 'Transaction description',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
