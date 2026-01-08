'use client';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, WithId } from '@/firebase';
import type { SchoolSettings } from '@/lib/types';

export interface UseSchoolSettingsResult {
  data: WithId<SchoolSettings> | null;
  isLoading: boolean;
  error: any;
}

const SETTINGS_DOC_ID = "main";

export function useSchoolSettings(): UseSchoolSettingsResult {
  const firestore = useFirestore();
  // useDoc doesn't require useMemoFirebase because the reference is stable.
  const settingsRef = doc(firestore, 'settings', SETTINGS_DOC_ID);
  const { data, isLoading, error } = useDoc<SchoolSettings>(settingsRef);
  
  return { data, isLoading, error };
}
