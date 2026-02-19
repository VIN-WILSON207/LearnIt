'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import styles from './page.module.css';
import { FiTrendingUp, FiAward } from 'react-icons/fi';
import { StudentLayout } from '@/components/StudentLayout';

export default function ProgressPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalHours: 0, completedCourses: 0, inProgress: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/enrollments?studentId=${user.id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        if (res.ok) {
          const data = await res.json();
          setEnrollments(data);

          const totalHours = data.reduce((sum: number, e: any) => sum + (e.hoursCompleted || 0), 0);
          const completed = data.filter((e: any) => e.status === 'completed').length;
          const inProgress = data.filter((e: any) => e.status === 'in-progress').length;

          setStats({ totalHours, completedCourses: completed, inProgress });
        }
      } catch (err) {
        console.error('Failed to load progress', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
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
            {loading ? (
              <Card><p>Loading progress...</p></Card>
            ) : enrollments.length === 0 ? (
              <Card><p>No enrolled courses yet</p></Card>
            ) : (
              enrollments.map(enrollment => {
                const percentage = enrollment.progress || 0;

                return (
                  <Card key={enrollment.id} className={styles.progressItem}>
                    <div className={styles.progressHeader}>
                      <h3>{enrollment.courseId}</h3>
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
