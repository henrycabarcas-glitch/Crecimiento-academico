'use client';
import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Student, Parent } from '@/lib/types';
import { WithId } from '@/firebase/firestore/use-collection';
import { useParents } from './use-parents';

export interface UseStudentsResult {
  data: (WithId<Student> & { parents?: WithId<Parent>[] })[] | null;
  isLoading: boolean;
  error: any;
}

export function useStudents(): UseStudentsResult {
  const firestore = useFirestore();
  const studentsCollection = useMemoFirebase(() => collection(firestore, 'students'), [firestore]);
  const studentsQuery = useMemoFirebase(() => query(studentsCollection, orderBy('lastName', 'asc')), [studentsCollection]);

  const { data: students, isLoading: isLoadingStudents, error: studentsError } = useCollection<Student>(studentsQuery);
  const { data: parents, isLoading: isLoadingParents, error: parentsError } = useParents();
  
  const studentsWithParents = useMemo(() => {
    if (!students || !parents) return null;
    
    return students.map(student => {
      const studentParents = student.parentIds?.map(parentId => parents.find(p => p.id === parentId)).filter(Boolean) as WithId<Parent>[];
      return {
        ...student,
        parents: studentParents || [],
      };
    });
  }, [students, parents]);

  return { 
    data: studentsWithParents, 
    isLoading: isLoadingStudents || isLoadingParents, 
    error: studentsError || parentsError 
  };
}
