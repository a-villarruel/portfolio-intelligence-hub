import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateDemandDto } from './dto/create-demand.dto';
import { DemandResponseDto } from './dto/demand-response.dto';
import { ListDemandsQueryDto } from './dto/list-demands-query.dto';
import { PaginatedDemandsResponseDto } from './dto/paginated-demands-response.dto';
import { ItDemandService } from './it-demand.service';

@ApiTags('demands')
@Controller('demands')
export class ItDemandController {
  constructor(private readonly itDemandService: ItDemandService) {}

  @Post()
  @ApiOperation({ summary: 'Register an IT demand' })
  @ApiCreatedResponse({ type: DemandResponseDto })
  @ApiBadRequestResponse({ description: 'The demand fields are invalid.' })
  create(@Body() input: CreateDemandDto): Promise<DemandResponseDto> {
    return this.itDemandService.create(input);
  }

  @Get()
  @ApiOperation({ summary: 'List IT demands' })
  @ApiOkResponse({ type: PaginatedDemandsResponseDto })
  @ApiBadRequestResponse({ description: 'The pagination parameters are invalid.' })
  findAll(@Query() query: ListDemandsQueryDto): Promise<PaginatedDemandsResponseDto> {
    return this.itDemandService.findAll(query);
  }
}
