
'use client';
import { useMemo } from 'react';
import { useTeachers, UseTeachersResult } from './use-teachers';
import type { User, Teacher } from '@/lib/types';
import { WithId } from '@/firebase/firestore/use-collection';

// Define a more specific result type for this hook
export interface UseUsersResult {
  data: User[] | null;
  isLoading: boolean;
  error: any;
  teachers: WithId<Teacher>[] | null;
}

export function useUsers(): UseUsersResult {
  const { data: teachers, isLoading: isLoadingTeachers, error: teachersError } = useTeachers();

  const users: User[] | null = useMemo(() => {
    // Wait until the hook has finished loading to process data
    if (isLoadingTeachers || !teachers) {
      return null;
    }

    const combinedUsers: User[] = [];

    // Add teachers to the combined list
    teachers.forEach(t => combinedUsers.push({
      ...t,
      // The role is already guaranteed by useTeachers hook
      sourceCollection: 'teachers'
    }));

    // Sort the final combined list
    return combinedUsers.sort((a, b) => {
      const aName = `${a.lastName} ${a.firstName}`;
      const bName = `${b.lastName} ${b.firstName}`;
      return aName.localeCompare(bName);
    });
  }, [teachers, isLoadingTeachers]);

  return {
    data: users,
    isLoading: isLoadingTeachers,
    error: teachersError,
    teachers,
  };
}
