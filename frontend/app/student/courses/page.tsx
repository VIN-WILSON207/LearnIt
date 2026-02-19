'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { getAllCourses } from '@/lib/api/courses';
import { BackendCourse } from '@/types';
import styles from './page.module.css';
import { FiStar, FiClock, FiUsers, FiBook } from 'react-icons/fi';
import { Button } from '@/components/Button';
import { StudentLayout } from '@/components/StudentLayout';

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAllCourses();
        setCourses(data);
      } catch (err: any) {
        console.error('Failed to fetch courses:', err);
        setError(err.message || 'Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = filter === 'all'
    ? courses
    : courses.filter(c => c.subject?.name === filter);

  const categories = Array.from(new Set(courses.map(c => c.subject?.name).filter(Boolean)));

  return (
    <ProtectedRoute requiredRole="student">
      <Navbar />
      <StudentLayout active="courses">
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Available Courses</h1>
            <p>Explore and enroll in new courses</p>
          </div>

        {/* Filters */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All Courses
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${filter === cat ? styles.active : ''}`}
              onClick={() => setFilter(cat as string)}
            >
              All Courses
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${filter === cat ? styles.active : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading courses...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--error)' }}>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" size="small" style={{ marginTop: '1rem' }}>
              Retry
            </Button>
          </div>
        )}

        {/* Courses Grid */}
        <div className={styles.coursesGrid}>
          {!isLoading && !error && filteredCourses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
              <p>No courses found in this category.</p>
            </div>
          )}
          {filteredCourses.map(course => (
            <Card key={course.id} className={styles.courseCard} onClick={() => router.push(`/student/courses/${course.id}`)}>
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className={styles.courseImage}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent infinite loop
                    target.src = 'https://placehold.co/400x225?text=No+Preview';
                  }}
                />
              ) : (
                <div className={styles.courseImagePlaceholder}>
                  <FiBook size={48} />
                </div>
              )}
              <div className={styles.courseContent}>
                <h3>{course.title}</h3>
                <p className={styles.courseDesc}>{course.description || 'No description available'}</p>

                <div className={styles.courseMeta}>
                  <div className={styles.metaItem}>
                    <FiClock />
                    <span>{course.lessons?.length || 0} Lessons</span>
                  </div>
                  <div className={styles.metaItem}>
                    <FiUsers />
                    <span>{course.instructor?.name || 'Instructor'}</span>
                  </div>
                </div>

                <div className={styles.courseFooter}>
                  <div className={styles.rating}>
                    <FiStar />
                    <span>4.5</span> {/* Backend doesn't have rating yet, using default */}
                  </div>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/student/courses/${course.id}`);
                    }}
                  >
                    Enroll Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </StudentLayout>
    </ProtectedRoute>
  );
}
