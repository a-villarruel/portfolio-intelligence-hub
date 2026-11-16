import { ApiProperty } from '@nestjs/swagger';
import { DemandResponseDto } from './demand-response.dto';

export class PaginatedDemandsResponseDto {
  @ApiProperty({ type: [DemandResponseDto] })
  items!: DemandResponseDto[];

  @ApiProperty({ minimum: 1 })
  page!: number;

  @ApiProperty({ minimum: 1, maximum: 100 })
  pageSize!: number;

  @ApiProperty({ minimum: 0 })
  total!: number;

  @ApiProperty({ minimum: 0 })
  totalPages!: number;
}
