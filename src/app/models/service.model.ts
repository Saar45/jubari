export interface Service {
  id: number;
  nom: string;
  description?: string;
  chef?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  employeId?: number;
}
