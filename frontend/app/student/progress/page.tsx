'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { getStudentEnrollments } from '@/lib/api/enrollments';
import { getUserProgress } from '@/lib/api/progress';
import { getCourseById } from '@/lib/api/courses';
import { Enrollment, Progress, BackendCourse } from '@/types';
import styles from './page.module.css';
import { FiTrendingUp, FiAward, FiBook } from 'react-icons/fi';

export default function ProgressPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [courses, setCourses] = useState<Record<string, BackendCourse>>({});
  const [stats, setStats] = useState({ totalHours: 0, completedCourses: 0, inProgress: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const [enrollmentsData, progressData] = await Promise.all([
          getStudentEnrollments(user.id),
          getUserProgress(),
        ]);

        setEnrollments(enrollmentsData);
        setProgressData(progressData);

        // Fetch course details
        const coursePromises = enrollmentsData.map(e => getCourseById(e.courseId).catch(() => null));
        const courseResults = await Promise.all(coursePromises);
        const coursesMap: Record<string, BackendCourse> = {};
        courseResults.forEach((c, i) => {
          if (c) coursesMap[enrollmentsData[i].courseId] = c;
        });
        setCourses(coursesMap);

        const completed = progressData.filter(p => p.percent >= 100).length;
        const inProgress = progressData.filter(p => p.percent > 0 && p.percent < 100).length;
        // Backend doesn't provide hours yet, using a heuristic or placeholder
        const totalHours = progressData.reduce((sum, p) => sum + Math.floor(p.percent / 10), 0);

        setStats({ totalHours, completedCourses: completed, inProgress });
      } catch (err: any) {
        console.error('Failed to fetch progress:', err);
        setError(err.message || 'Failed to load progress data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <ProtectedRoute requiredRole="student">
      <Navbar />
      <StudentLayout active="progress">
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Your Learning Progress</h1>
            <p>Track your course completion and learning achievements</p>
          </div>

        {/* Progress Summary */}
        <div className={styles.summaryGrid}>
          <Card className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <FiTrendingUp />
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryLabel}>Learning Hours</div>
              <div className={styles.summaryValue}>{stats.totalHours}</div>
            </div>
          </Card>

          <Card className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <FiAward />
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryLabel}>Completed Courses</div>
              <div className={styles.summaryValue}>{stats.completedCourses}</div>
            </div>
          </Card>

          <Card className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <FiTrendingUp />
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryLabel}>In Progress</div>
              <div className={styles.summaryValue}>{stats.inProgress}</div>
            </div>
          </Card>
        </div>

        {/* Detailed Progress */}
        <div className={styles.section}>
          <h2>Course Progress Details</h2>
          <div className={styles.progressList}>
            {isLoading && <p>Loading detailed progress...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!isLoading && enrollments.length === 0 && (
              <Card>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>You haven't enrolled in any courses yet.</p>
                </div>
              </Card>
            )}
            {enrollments.map(enrollment => {
              const course = courses[enrollment.courseId];
              const progress = progressData.find(p => p.courseId === enrollment.courseId);
              const percentage = progress?.percent || 0;

              return (
                <Card key={enrollment.id} className={styles.progressItem}>
                  <div className={styles.progressHeader}>
                    <h3>{course?.title || 'Loading course...'}</h3>
                    <span className={`${styles.statusBadge} ${percentage >= 100 ? styles.completed : styles.in_progress}`}>
                      {percentage >= 100 ? '✓ Completed' : 'In Progress'}
                    </span>
                  </div>

                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className={styles.progressStats}>
                    <div className={styles.stat}>
                      <span className={styles.label}>Progress</span>
                      <span className={styles.value}>{percentage}%</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Lessons</span>
                      <span className={styles.value}>
                        {course?.lessons?.length || 0}
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Enrolled</span>
                      <span className={styles.value}>
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className={styles.progressStats}>
                      <div className={styles.stat}>
                        <span className={styles.label}>Progress</span>
                        <span className={styles.value}>{percentage}%</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.label}>Hours</span>
                        <span className={styles.value}>
                          {enrollment.hoursCompleted || 0} / {enrollment.totalHours || 0}
                        </span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.label}>Enrolled</span>
                        <span className={styles.value}>{enrollment.enrolledDate}</span>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Completion Stats */}
        <div className={styles.section}>
          <h2>Overall Statistics</h2>
          <div className={styles.statsGrid}>
            <Card className={styles.statBox}>
              <div className={styles.statNumber}>{stats.totalHours}</div>
              <div className={styles.statLabel}>Total Learning Hours</div>
            </Card>
            <Card className={styles.statBox}>
              <div className={styles.statNumber}>{stats.completedCourses}</div>
              <div className={styles.statLabel}>Courses Completed</div>
            </Card>
            <Card className={styles.statBox}>
              <div className={styles.statNumber}>
                {enrollments.length > 0
                  ? Math.round((stats.completedCourses / enrollments.length) * 100)
                  : 0}%
              </div>
              <div className={styles.statLabel}>Overall Completion Rate</div>
            </Card>
          </div>
        </div>
        </div>
      </StudentLayout>
    </ProtectedRoute>
  );
}
