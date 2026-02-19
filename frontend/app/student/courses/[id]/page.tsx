'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getCourseById } from '@/lib/api/courses';
import { enrollInCourse, getStudentEnrollments } from '@/lib/api/enrollments';
import { BackendCourse, Enrollment } from '@/types';
import styles from './page.module.css';
import { FiPlay, FiCheckCircle, FiLock, FiClock, FiFileText } from 'react-icons/fi';

export default function CourseDetailPage() {
     const { id } = useParams();
     const router = useRouter();
     const { user } = useAuth();
     const [course, setCourse] = useState<BackendCourse | null>(null);
     const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [isEnrolling, setIsEnrolling] = useState(false);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          const fetchData = async () => {
               if (!id || !user) return;
               setIsLoading(true);
               setError(null);
               try {
                    const [courseData, enrollmentsData] = await Promise.all([
                         getCourseById(id as string),
                         getStudentEnrollments(user.id),
                    ]);
                    setCourse(courseData);
                    const existingEnrollment = enrollmentsData.find(e => e.courseId === id);
                    setEnrollment(existingEnrollment || null);
               } catch (err: any) {
                    console.error('Failed to fetch course details:', err);
                    setError(err.message || 'Failed to load course details');
               } finally {
                    setIsLoading(false);
               }
          };
          fetchData();
     }, [id, user]);

     const handleEnroll = async () => {
          if (!id || !user) return;
          setIsEnrolling(true);
          try {
               const newEnrollment = await enrollInCourse({ courseId: id as string });
               setEnrollment(newEnrollment);
          } catch (err: any) {
               alert(err.message || 'Failed to enroll in course');
          } finally {
               setIsEnrolling(false);
          }
     };

     if (isLoading) {
          return (
               <ProtectedRoute requiredRole="student">
                    <Navbar />
                    <div className={styles.container}>
                         <p style={{ textAlign: 'center', padding: '3rem' }}>Loading course details...</p>
                    </div>
               </ProtectedRoute>
          );
     }

     if (error || !course) {
          return (
               <ProtectedRoute requiredRole="student">
                    <Navbar />
                    <div className={styles.container}>
                         <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--error)' }}>
                              {error || 'Course not found'}
                         </p>
                    </div>
               </ProtectedRoute>
          );
     }

     return (
          <ProtectedRoute requiredRole="student">
               <Navbar />
               <div className={styles.container}>
                    <div className={styles.header}>
                         <div className={styles.headerContent}>
                              <h1>{course.title}</h1>
                              <p className={styles.category}>{course.subject?.name}</p>
                              <p className={styles.description}>{course.description}</p>
                              <div className={styles.meta}>
                                   <div className={styles.metaItem}>
                                        <FiClock /> <span>{course.lessons?.length || 0} Lessons</span>
                                   </div>
                                   <div className={styles.metaItem}>
                                        <FiFileText /> <span>{course.instructor?.name}</span>
                                   </div>
                              </div>
                              {!enrollment ? (
                                   <Button
                                        variant="primary"
                                        size="large"
                                        onClick={handleEnroll}
                                        disabled={isEnrolling}
                                        className={styles.enrollBtn}
                                   >
                                        {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                                   </Button>
                              ) : (
                                   <div className={styles.enrolledBadge}>
                                        <FiCheckCircle /> <span>Enrolled</span>
                                   </div>
                              )}
                         </div>
                         {course.thumbnailUrl && (
                              <div className={styles.thumbnail}>
                                   <img
                                        src={course.thumbnailUrl}
                                        alt={course.title}
                                        onError={(e) => {
                                             const target = e.target as HTMLImageElement;
                                             target.onerror = null;
                                             target.src = 'https://placehold.co/800x450?text=Course+Preview';
                                        }}
                                   />
                              </div>
                         )}
                    </div>

                    <div className={styles.content}>
                         <div className={styles.lessonsSection}>
                              <h2>Course Content</h2>
                              <div className={styles.lessonsList}>
                                   {course.lessons && course.lessons.length > 0 ? (
                                        course.lessons.sort((a, b) => a.orderNumber - b.orderNumber).map((lesson) => (
                                             <Card key={lesson.id} className={styles.lessonItem}>
                                                  <div className={styles.lessonInfo}>
                                                       <span className={styles.order}>{lesson.orderNumber}</span>
                                                       <div className={styles.lessonText}>
                                                            <h3>{lesson.title}</h3>
                                                            {lesson.isFree && <span className={styles.freeBadge}>Free Preview</span>}
                                                       </div>
                                                  </div>
                                                  {enrollment || lesson.isFree ? (
                                                       <Button
                                                            variant="outline"
                                                            size="small"
                                                            onClick={() => router.push(`/student/lessons/${lesson.id}`)}
                                                       >
                                                            <FiPlay /> Watch
                                                       </Button>
                                                  ) : (
                                                       <div className={styles.locked}>
                                                            <FiLock /> Locked
                                                       </div>
                                                  )}
                                             </Card>
                                        ))
                                   ) : (
                                        <p className={styles.empty}>No lessons available for this course yet.</p>
                                   )}
                              </div>
                         </div>

                         <div className={styles.sidebar}>
                              <Card className={styles.courseStats}>
                                   <h3>About this course</h3>
                                   <ul>
                                        <li>Level: {course.subject?.level?.name || 'All Levels'}</li>
                                        <li>Access: Lifetime</li>
                                        <li>Certificate: Yes</li>
                                   </ul>
                              </Card>
                         </div>
                    </div>
               </div>
          </ProtectedRoute>
     );
}
