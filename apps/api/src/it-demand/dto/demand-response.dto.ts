import { ApiProperty } from '@nestjs/swagger';

export class DemandResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ maxLength: 120 })
  title!: string;

  @ApiProperty({ maxLength: 4000 })
  description!: string;

  @ApiProperty({ maxLength: 120 })
  requesterName!: string;

  @ApiProperty({ enum: ['New'] })
  status!: 'New';

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}
