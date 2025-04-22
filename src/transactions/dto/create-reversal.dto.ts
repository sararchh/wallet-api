import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReversalDto {
  @ApiProperty({ example: 1, description: 'Transaction ID to reverse' })
  @IsNumber()
  @IsNotEmpty()
  transactionId: number;

  @ApiProperty({ example: 'Wrong transfer', description: 'Reason for reversal' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
