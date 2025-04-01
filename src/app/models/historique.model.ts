export interface Historique {
  id: number;
  dateDemande: string;
  dateDecision: string;
  etat: 'En attente' | 'Accepte' | 'Refuse' | 'En attente RH';
}