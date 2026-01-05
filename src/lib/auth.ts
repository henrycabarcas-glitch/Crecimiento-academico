'use client';

import { UserRole } from "./types";

export const MANAGEMENT_ROLES: UserRole[] = ['Director', 'Directivo Docente', 'Administrador'];

export function hasManagementRole(role?: UserRole | null): boolean {
    if (!role) {
        return false;
    }
    return MANAGEMENT_ROLES.includes(role);
}

    