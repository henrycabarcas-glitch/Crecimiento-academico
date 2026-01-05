'use client';
import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useTeachers } from './use-teachers';
import type { Course } from '@/lib/types';
import { WithId } from '@/firebase/firestore/use-collection';

export interface UseCoursesResult {
  data: (WithId<Course> & { teacher?: { firstName: string; lastName: string; } })[] | null;
  isLoading: boolean;
  error: any;
}

export function useCourses(): UseCoursesResult {
  const firestore = useFirestore();
  const coursesCollection = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const coursesQuery = useMemoFirebase(() => query(coursesCollection, orderBy('name', 'asc')), [coursesCollection]);

  const { data: courses, isLoading: isLoadingCourses, error: coursesError } = useCollection<Course>(coursesQuery);
  const { data: teachers, isLoading: isLoadingTeachers, error: teachersError } = useTeachers();

  const coursesWithTeachers = useMemo(() => {
    if (!courses || !teachers) return null;

    return courses.map(course => {
      const teacher = teachers.find(t => t.id === course.teacherId);
      return {
        ...course,
        teacher: teacher ? { firstName: teacher.firstName, lastName: teacher.lastName } : undefined,
      };
    });
  }, [courses, teachers]);

  return {
    data: coursesWithTeachers,
    isLoading: isLoadingCourses || isLoadingTeachers,
    error: coursesError || teachersError,
  };
}
