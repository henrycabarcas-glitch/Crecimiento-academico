'use client';
import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Parent } from '@/lib/types';
import { WithId } from '@/firebase/firestore/use-collection';

export interface UseParentsResult {
  data: WithId<Parent>[] | null;
  isLoading: boolean;
  error: any;
}

export function useParents(): UseParentsResult {
  const firestore = useFirestore();
  const parentsCollection = useMemoFirebase(() => collection(firestore, 'parents'), [firestore]);
  const parentsQuery = useMemoFirebase(() => query(parentsCollection, orderBy('lastName', 'asc')), [parentsCollection]);

  const { data, isLoading, error } = useCollection<Parent>(parentsQuery);

  return { data, isLoading, error };
}
