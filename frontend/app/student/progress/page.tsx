'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { mockCourses, mockEnrollments } from '@/lib/mockData';
import styles from './page.module.css';
import { FiTrendingUp, FiAward } from 'react-icons/fi';

export default function ProgressPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalHours: 0, completedCourses: 0, inProgress: 0 });

  useEffect(() => {
    if (user) {
      const studentEnrollments = mockEnrollments.filter(e => e.studentId === user.id);
      setEnrollments(studentEnrollments);

      const totalHours = studentEnrollments.reduce((sum, e) => sum + e.hoursCompleted, 0);
      const completed = studentEnrollments.filter(e => e.status === 'completed').length;
      const inProgress = studentEnrollments.filter(e => e.status === 'in-progress').length;

      setStats({ totalHours, completedCourses: completed, inProgress });
    }
  }, [user]);

  return (
    <ProtectedRoute requiredRole="student">
      <Navbar />
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
            {enrollments.map(enrollment => {
              const course = mockCourses.find(c => c.id === enrollment.courseId);
              const percentage = enrollment.progress;
              
              return (
                <Card key={enrollment.id} className={styles.progressItem}>
                  <div className={styles.progressHeader}>
                    <h3>{course?.title}</h3>
                    <span className={`${styles.statusBadge} ${styles[enrollment.status]}`}>
                      {enrollment.status === 'completed' ? '✓ Completed' : 'In Progress'}
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
                      <span className={styles.label}>Hours</span>
                      <span className={styles.value}>
                        {enrollment.hoursCompleted} / {course?.hours}
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Enrolled</span>
                      <span className={styles.value}>{enrollment.enrolledDate}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
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
    </ProtectedRoute>
  );
}
