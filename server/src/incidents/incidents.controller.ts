import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import type { IncidentDto } from 'src/models/dto/incident/incident.dto';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() dto: IncidentDto) {
    return this.incidentsService.create(dto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.incidentsService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: IncidentDto) {
    return this.incidentsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(Number(id));
  }
}
