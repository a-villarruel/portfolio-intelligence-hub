import { ApiProperty } from '@nestjs/swagger';
import { DemandResponseDto } from './demand-response.dto';

export class PaginatedDemandsResponseDto {
  @ApiProperty({ type: [DemandResponseDto] })
  items!: DemandResponseDto[];

  @ApiProperty({ type: 'integer', minimum: 1 })
  page!: number;

  @ApiProperty({ type: 'integer', minimum: 1, maximum: 100 })
  pageSize!: number;

  @ApiProperty({ type: 'integer', minimum: 0 })
  total!: number;

  @ApiProperty({ type: 'integer', minimum: 0 })
  totalPages!: number;
}
