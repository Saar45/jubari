export interface Message {
  id?: number;
  date_reclamation: string;
  description: string;
  employe_id: number;
}

export interface MessagePayload {
  date: string;
  description: string;
  idE: number;
}
