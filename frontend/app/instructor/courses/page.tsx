'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getInstructorCourses } from '@/lib/api/courses';
import { BackendCourse } from '@/types';
import Link from 'next/link';
import styles from './page.module.css';
import { FiBook, FiPlus } from 'react-icons/fi';

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const instructorCourses = await getInstructorCourses(user.id);
        setCourses(instructorCourses);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <ProtectedRoute requiredRole="instructor">
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Courses</h1>
          <p>View and manage your courses</p>
          <Link href="/instructor/dashboard?create=1">
            <Button variant="primary">
              <FiPlus /> Create New Course
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className={styles.loading}>
            <p>Loading courses...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className={styles.coursesList}>
            {courses.length === 0 ? (
              <Card>
                <div className={styles.empty}>
                  <FiBook size={48} />
                  <p>No courses yet.</p>
                  <Link href="/instructor/dashboard">
                    <Button variant="primary">Create your first course</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              courses.map((course) => (
                <Card key={course.id} className={styles.courseItem}>
                  {course.thumbnailUrl && (
                    <div className={styles.courseThumb}>
                      <img src={course.thumbnailUrl} alt="" className={styles.courseThumbImg} />
                    </div>
                  )}
                  <div className={styles.courseHeader}>
                    <div>
                      <h3>{course.title}</h3>
                      <p>{course.description || 'No description'}</p>
                    </div>
                    <span className={`${styles.badge} ${course.isPublished ? styles.published : styles.draft}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className={styles.courseStats}>
                    <span>Subject: {course.subject?.name || 'N/A'}</span>
                    <span>Lessons: {course.lessons?.length || 0}</span>
                    <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.courseActions}>
                    <Link href={`/student/courses`}>
                      <Button variant="outline">View</Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
