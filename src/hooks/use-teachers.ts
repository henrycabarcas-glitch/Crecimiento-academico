'use client';
import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Teacher } from '@/lib/types';
import { WithId } from '@/firebase/firestore/use-collection';

export interface UseTeachersResult {
  data: WithId<Teacher>[] | null;
  isLoading: boolean;
  error: any;
}

export function useTeachers(): UseTeachersResult {
  const firestore = useFirestore();
  const teachersCollection = useMemoFirebase(() => collection(firestore, 'teachers'), [firestore]);
  const teachersQuery = useMemoFirebase(() => query(teachersCollection, orderBy('lastName', 'asc')), [teachersCollection]);

  const { data, isLoading, error } = useCollection<Teacher>(teachersQuery);

  const teacherData = useMemo(() => {
    if (!data) return null;
    return data.map(t => ({
      ...t,
      role: t.role || 'Profesor'
    }));
  }, [data]);

  return { data: teacherData, isLoading, error };
}
