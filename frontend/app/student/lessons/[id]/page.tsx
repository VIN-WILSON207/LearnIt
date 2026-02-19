'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getCourseById } from '@/lib/api/courses';
import { updateProgress } from '@/lib/api/progress';
import { getQuiz } from '@/lib/api/quizzes';
import { BackendCourse } from '@/types';
import styles from './page.module.css';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiFileText } from 'react-icons/fi';

export default function LessonPage() {
     const { id } = useParams();
     const router = useRouter();
     const [lesson, setLesson] = useState<any>(null);
     const [course, setCourse] = useState<BackendCourse | null>(null);
     const [hasQuiz, setHasQuiz] = useState(false);
     const [isLoading, setIsLoading] = useState(true);
     const [isCompleting, setIsCompleting] = useState(false);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          const fetchData = async () => {
               if (!id) return;
               setIsLoading(true);
               try {
                    // We need to find which course this lesson belongs to
                    // For now, we fetch all courses or expect the ID to be a combined structure
                    // But since the API returns lesson by direct ID normally, we fetch the course info from the lesson
                    // THE BACKEND doesn't have a getLessonById, it has lessons inside getCourseById
                    // So we might need to fetch the course first if we had the courseId
                    // Let's search for the course that contains this lesson
                    const allCourses = await (await import('@/lib/api/courses')).getAllCourses();
                    let foundCourse: BackendCourse | null = null;
                    let foundLesson: any = null;

                    for (const c of allCourses) {
                         const fullCourse = await getCourseById(c.id);
                         const l = fullCourse.lessons?.find(l => l.id === id);
                         if (l) {
                              foundCourse = fullCourse;
                              foundLesson = l;
                              break;
                         }
                    }

                    if (foundLesson && foundCourse) {
                         setLesson(foundLesson);
                         setCourse(foundCourse);

                         // Check if lesson has a quiz
                         try {
                              const quiz = await getQuiz(foundLesson.id);
                              setHasQuiz(!!quiz);
                         } catch {
                              setHasQuiz(false);
                         }
                    } else {
                         setError('Lesson not found');
                    }
               } catch (err: any) {
                    setError(err.message || 'Failed to load lesson');
               } finally {
                    setIsLoading(false);
               }
          };
          fetchData();
     }, [id]);

     const handleComplete = async () => {
          if (!course || !lesson) return;
          setIsCompleting(true);
          try {
               await updateProgress({
                    courseId: course.id,
                    lessonId: lesson.id,
                    status: 'completed'
               });

               if (hasQuiz) {
                    router.push(`/student/quizzes/lesson/${lesson.id}`);
               } else {
                    // Go to next lesson if available
                    const nextLesson = course.lessons?.find(l => l.orderNumber === lesson.orderNumber + 1);
                    if (nextLesson) {
                         router.push(`/student/lessons/${nextLesson.id}`);
                    } else {
                         router.push(`/student/courses/${course.id}`);
                    }
               }
          } catch (err: any) {
               alert(err.message || 'Failed to update progress');
          } finally {
               setIsCompleting(false);
          }
     };

     if (isLoading) return <div className={styles.loading}>Loading lesson...</div>;
     if (error) return <div className={styles.error}>{error}</div>;

     return (
          <ProtectedRoute requiredRole="student">
               <Navbar />
               <div className={styles.container}>
                    <div className={styles.videoSection}>
                         {lesson?.videoUrl ? (
                              <div className={styles.videoWrapper}>
                                   <video controls src={lesson.videoUrl} className={styles.video} />
                              </div>
                         ) : (
                              <div className={styles.noVideo}>
                                   <FiFileText size={64} />
                                   <p>This lesson contains text content only.</p>
                              </div>
                         )}
                    </div>

                    <div className={styles.contentSection}>
                         <div className={styles.header}>
                              <div className={styles.breadcrumb}>
                                   <span onClick={() => router.push(`/student/courses/${course?.id}`)}>{course?.title}</span>
                                   <span> / </span>
                                   <span>Lesson {lesson?.orderNumber}</span>
                              </div>
                              <h1>{lesson?.title}</h1>
                         </div>

                         <Card className={styles.lessonContent}>
                              <div dangerouslySetInnerHTML={{ __html: lesson?.content || 'No content available' }} />
                         </Card>

                         <div className={styles.actions}>
                              <Button
                                   variant="outline"
                                   onClick={() => router.back()}
                              >
                                   <FiChevronLeft /> Previous
                              </Button>

                              <Button
                                   variant="primary"
                                   onClick={handleComplete}
                                   disabled={isCompleting}
                              >
                                   <FiCheckCircle /> {hasQuiz ? 'Take Quiz' : 'Complete & Next'} <FiChevronRight />
                              </Button>
                         </div>
                    </div>
               </div>
          </ProtectedRoute>
     );
}
