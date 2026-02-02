'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getInstructorCourses } from '@/lib/api/courses';
import { getEnrollments } from '@/lib/api/enrollments';
import { BackendCourse } from '@/types';
import styles from './page.module.css';
import { FiUsers, FiBook, FiBarChart2 } from 'react-icons/fi';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      try {
        // Get instructor's courses
        const instructorCourses = await getInstructorCourses(user.id);
        setCourses(instructorCourses);
        setTotalCourses(instructorCourses.length);

        // Get all enrollments to count unique students
        const allEnrollments = await getEnrollments();
        const studentIds = new Set<string>();
        instructorCourses.forEach((course) => {
          allEnrollments.forEach((enrollment) => {
            if (enrollment.courseId === course.id) {
              studentIds.add(enrollment.studentId);
            }
          });
        });
        setTotalStudents(studentIds.size);
      } catch (err) {
        console.error('Failed to fetch instructor data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="instructor">
        <Navbar />
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="instructor">
        <Navbar />
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--error)' }}>
            <p>{error}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="instructor">
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Welcome, {user?.name}!</h1>
          <p>Manage your courses and track student progress</p>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <FiBook />
              </div>
              <div>
                <div className={styles.statLabel}>Courses Created</div>
                <div className={styles.statValue}>{totalCourses}</div>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <FiUsers />
              </div>
              <div>
                <div className={styles.statLabel}>Total Students</div>
                <div className={styles.statValue}>{totalStudents}</div>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <FiBarChart2 />
              </div>
              <div>
                <div className={styles.statLabel}>Published Courses</div>
                <div className={styles.statValue}>{courses.filter(c => c.isPublished).length}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Course Management */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>My Courses</h2>
            <Button variant="primary">Create New Course</Button>
          </div>

          <div className={styles.coursesList}>
            {courses.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  <p>No courses yet. Create your first course to get started!</p>
                </div>
              </Card>
            ) : (
              courses.map((course) => (
                <Card key={course.id} className={styles.courseItem}>
                  <div className={styles.courseHeader}>
                    <div>
                      <h3>{course.title}</h3>
                      <p>{course.description || 'No description'}</p>
                    </div>
                    <div className={styles.courseStatus}>
                      <span className={`${styles.badge} ${course.isPublished ? styles.active : styles.pending}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.courseStats}>
                    <div className={styles.stat}>
                      <span className={styles.label}>Subject:</span>
                      <span className={styles.value}>{course.subject?.name || 'N/A'}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Lessons:</span>
                      <span className={styles.value}>{course.lessons?.length || 0}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Created:</span>
                      <span className={styles.value}>{new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className={styles.courseActions}>
                    <Button variant="outline">View Details</Button>
                    <Button variant="outline">Edit Course</Button>
                    <Button variant="outline">Upload Lesson</Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className={styles.section}>
          <h2>Recent Student Submissions</h2>
          <Card>
            <div className={styles.submissionsList}>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                No recent submissions
              </p>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
