'use client';
import { useMemo } from 'react';
import { useTeachers, UseTeachersResult } from './use-teachers';
import { useParents, UseParentsResult } from './use-parents';
import type { User, Teacher, Parent } from '@/lib/types';
import { WithId } from '@/firebase/firestore/use-collection';

// Define a more specific result type for this hook
export interface UseUsersResult {
  data: User[] | null;
  isLoading: boolean;
  error: any;
  teachers: WithId<Teacher>[] | null;
  parents: WithId<Parent>[] | null;
}

export function useUsers(): UseUsersResult {
  const { data: teachers, isLoading: isLoadingTeachers, error: teachersError } = useTeachers();
  const { data: parents, isLoading: isLoadingParents, error: parentsError } = useParents();

  const users: User[] | null = useMemo(() => {
    // Wait until both hooks have finished loading to combine data
    if (isLoadingTeachers || isLoadingParents || !teachers || !parents) {
      return null;
    }

    const combinedUsers: User[] = [];

    // Add teachers to the combined list
    teachers.forEach(t => combinedUsers.push({
      ...t,
      // The role is already guaranteed by useTeachers hook
      sourceCollection: 'teachers'
    }));

    // Add parents to the combined list
    parents.forEach(p => combinedUsers.push({
      ...p,
      role: 'Acudiente', // Parents always have the 'Acudiente' role
      sourceCollection: 'parents'
    }));

    // Sort the final combined list
    return combinedUsers.sort((a, b) => {
      const aName = `${a.lastName} ${a.firstName}`;
      const bName = `${b.lastName} ${b.firstName}`;
      return aName.localeCompare(bName);
    });
  }, [teachers, parents, isLoadingTeachers, isLoadingParents]);

  return {
    data: users,
    isLoading: isLoadingTeachers || isLoadingParents,
    error: teachersError || parentsError,
    teachers,
    parents,
  };
}
