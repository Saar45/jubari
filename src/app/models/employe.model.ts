import { Service } from './service.model';

export interface Employe {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    role: string;
    service?: Service;
    serviceDirige?: Service;
    adresse?: string;
    code_postal?: string;
    nb_conges_payes?: number;
    ville?: string;
    salaire_base?: number;
    heures_supplementaires?: number;
}

export type EmployeRole = 'ADMIN' | 'RH' | 'CHEF_SERVICE' | 'EMPLOYE';
