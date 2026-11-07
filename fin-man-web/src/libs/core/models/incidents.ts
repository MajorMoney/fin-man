export type IncidentStatus = 'open' | 'resolved';

export interface Incident {
  id: number;
  source: string;
  sourceId: number | null;
  title: string;
  message: string;
  status: IncidentStatus;
  createdAt: string;
}
