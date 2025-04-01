import { Service } from './service.model';

export interface User {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    role: string;
    service?: Service;
    password?: string;
    oldPassword?: string;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    EMPLOYEE = 'EMPLOYEE'
}
