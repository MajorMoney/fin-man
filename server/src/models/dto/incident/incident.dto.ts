import { IncidentStatus } from 'src/models/schemas/incident.schema';

export interface IncidentDto {
  source?: string;
  sourceId?: number | null;
  title?: string;
  message?: string;
  status?: IncidentStatus;
}
