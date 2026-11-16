import { Injectable } from '@nestjs/common';
import type { Demand } from '../generated/prisma/client';
import type { DemandSelect } from '../generated/prisma/models/Demand';
import { PrismaService } from '../database/prisma.service';
import { CreateDemandDto } from './dto/create-demand.dto';
import { DemandResponseDto } from './dto/demand-response.dto';
import { ListDemandsQueryDto } from './dto/list-demands-query.dto';
import { PaginatedDemandsResponseDto } from './dto/paginated-demands-response.dto';

const demandResponseSelect = {
  id: true,
  title: true,
  description: true,
  requesterName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies DemandSelect;

function toDemandResponse(demand: Demand): DemandResponseDto {
  return {
    id: demand.id,
    title: demand.title,
    description: demand.description,
    requesterName: demand.requesterName,
    status: demand.status,
    createdAt: demand.createdAt,
    updatedAt: demand.updatedAt,
  };
}

@Injectable()
export class ItDemandService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateDemandDto): Promise<DemandResponseDto> {
    const demand = await this.prisma.demand.create({
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        requesterName: input.requesterName.trim(),
      },
      select: demandResponseSelect,
    });

    return toDemandResponse(demand);
  }

  async findAll({ page, pageSize }: ListDemandsQueryDto): Promise<PaginatedDemandsResponseDto> {
    const total = await this.prisma.demand.count();
    const skip = (page - 1) * pageSize;
    const demands =
      Number.isSafeInteger(skip) && skip < total
        ? await this.prisma.demand.findMany({
            skip,
            take: pageSize,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            select: demandResponseSelect,
          })
        : [];

    return {
      items: demands.map(toDemandResponse),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
