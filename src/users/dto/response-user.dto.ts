import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class UserResponseDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the user',
  })
  id: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  email: string;

  @ApiProperty({
    example: '100.00',
    description: 'The current balance of the user',
  })
  balance: Decimal;

  @ApiProperty({
    example: '2024-04-22T10:00:00.000Z',
    description: 'The creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-04-22T10:00:00.000Z',
    description: 'The last update timestamp',
  })
  updatedAt: Date;
}
