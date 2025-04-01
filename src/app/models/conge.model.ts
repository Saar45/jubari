import { Employe } from './employe.model';
import { Historique } from './historique.model';

export interface Conge {
  id: number;
  employe: Employe;
  dateDebut: string;
  dateFin: string;
  description: string;
  historiqueConge: Historique;
  paye: number;
  motif_refus?: string;
  motif?: string;
  avis_chef_direct?: number;
  nom_signataire_chef?: string;
  prenom_signataire_chef?: string;
  date_decision_chef_direct?: string;
}

export interface CongeStats {
  en_attente: number;
  rejete: number;
  accepte: number;
}
