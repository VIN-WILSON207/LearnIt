/**
 * Course Data Transformers
 * 
 * Transform backend course data to frontend format
 */

import { BackendCourse, Course } from '@/types';

/**
 * Transform backend course to frontend course format
 */
export function transformCourse(backendCourse: BackendCourse): Course {
  return {
    id: backendCourse.id,
    title: backendCourse.title,
    description: backendCourse.description || '',
    category: backendCourse.subject?.name || 'Uncategorized',
    instructor: backendCourse.instructor?.name || 'Unknown',
    enrolledCount: 0, // Will need to be fetched separately or added to backend
    rating: 0, // Will need to be added to backend
    minPlan: 'free', // Will need to be added to backend
    modules: backendCourse.lessons?.map((lesson, index) => ({
      id: lesson.id,
      courseId: backendCourse.id,
      title: lesson.title,
      description: lesson.content || '',
      topics: [
        {
          id: lesson.id,
          moduleId: lesson.id,
          title: lesson.title,
          content: lesson.content || '',
          videoUrl: lesson.videoUrl || undefined,
          duration: undefined, // Will need to be calculated or added
        }
      ]
    })) || [],
  };
}

/**
 * Transform array of backend courses
 */
export function transformCourses(backendCourses: BackendCourse[]): Course[] {
  return backendCourses.map(transformCourse);
}
