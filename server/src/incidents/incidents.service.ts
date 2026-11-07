import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IncidentDto } from 'src/models/dto/incident/incident.dto';
import {
  INCIDENT_STATUSES,
  Incident,
  IncidentDocument,
  IncidentStatus,
} from 'src/models/schemas/incident.schema';
import { generateId } from 'src/utils/id-generator';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectModel(Incident.name)
    private readonly incidentModel: Model<IncidentDocument>,
  ) {}

  async create(dto: IncidentDto): Promise<IncidentDocument> {
    return new this.incidentModel({
      id: generateId(),
      source: this.assertText(dto.source, 'Source', true),
      sourceId: this.assertSourceId(dto.sourceId),
      title: this.assertText(dto.title, 'Title', true),
      message: this.assertText(dto.message, 'Message', true),
      status: dto.status == null ? 'open' : this.assertStatus(dto.status),
      createdAt: new Date().toISOString(),
    }).save();
  }

  /**
   * Open incident for this source, or refresh the existing open one.
   * Catch-up can fail on every boot; we keep one open incident, not a stack.
   */
  async report(dto: IncidentDto): Promise<IncidentDocument> {
    const source = this.assertText(dto.source, 'Source', true);
    const sourceId = this.assertSourceId(dto.sourceId);
    const title = this.assertText(dto.title, 'Title', true);
    const message = this.assertText(dto.message, 'Message', true);

    const existing = await this.incidentModel
      .findOne({ source, sourceId, status: 'open' })
      .exec();
    if (existing) {
      existing.title = title;
      existing.message = message;
      return existing.save();
    }
    return this.create({ source, sourceId, title, message, status: 'open' });
  }

  async findAll(status?: string): Promise<IncidentDocument[]> {
    const filter =
      status == null || status === ''
        ? {}
        : { status: this.assertStatus(status) };
    return this.incidentModel
      .find(filter)
      .sort({ createdAt: -1, id: -1 })
      .exec();
  }

  async findOne(id: number): Promise<IncidentDocument> {
    return this.get(id);
  }

  async update(id: number, dto: IncidentDto): Promise<IncidentDocument> {
    const incident = await this.get(id);
    if (dto.source !== undefined) {
      incident.source = this.assertText(dto.source, 'Source', true);
    }
    if (dto.sourceId !== undefined) {
      incident.sourceId = this.assertSourceId(dto.sourceId);
    }
    if (dto.title !== undefined) {
      incident.title = this.assertText(dto.title, 'Title', true);
    }
    if (dto.message !== undefined) {
      incident.message = this.assertText(dto.message, 'Message', true);
    }
    if (dto.status !== undefined) {
      incident.status = this.assertStatus(dto.status);
    }
    return incident.save();
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.incidentModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Incident not found');
    }
    return { message: 'Incident deleted' };
  }

  private async get(id: number): Promise<IncidentDocument> {
    const incident = await this.incidentModel.findOne({ id }).exec();
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  private assertStatus(value: unknown): IncidentStatus {
    if (
      typeof value === 'string' &&
      (INCIDENT_STATUSES as readonly string[]).includes(value)
    ) {
      return value as IncidentStatus;
    }
    throw new BadRequestException('Status must be open or resolved');
  }

  private assertSourceId(value: unknown): number | null {
    if (value == null) return null;
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new BadRequestException('Source id must be a number');
    }
    return value;
  }

  private assertText(value: unknown, label: string, required: boolean): string {
    if (value == null) {
      if (required) throw new BadRequestException(`${label} is required`);
      return '';
    }
    if (typeof value !== 'string') {
      throw new BadRequestException(`${label} must be text`);
    }
    const text = value.trim();
    if (required && !text) {
      throw new BadRequestException(`${label} is required`);
    }
    return text;
  }
}
