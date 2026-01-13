
'use client';
import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Student } from '@/lib/types';
import { WithId } from '@/firebase/firestore/use-collection';

export interface UseStudentsResult {
  data: WithId<Student>[] | null;
  isLoading: boolean;
  error: any;
}

export function useStudents(): UseStudentsResult {
  const firestore = useFirestore();
  const studentsCollection = useMemoFirebase(() => collection(firestore, 'students'), [firestore]);
  const studentsQuery = useMemoFirebase(() => query(studentsCollection, orderBy('lastName', 'asc')), [studentsCollection]);

  const { data, isLoading, error } = useCollection<Student>(studentsQuery);
  
  return { 
    data, 
    isLoading, 
    error
  };
}
