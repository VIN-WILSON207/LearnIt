'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getPlatformAnalytics } from '@/lib/api/analytics';
import { getAllUsers } from '@/lib/api/users';
import { getAllCourses } from '@/lib/api/courses';
import { normalizeRole } from '@/lib/apiClient';
import { BackendUser, BackendCourse, PlatformAnalytics } from '@/types';
import styles from './page.module.css';
import { FiUsers, FiBook, FiTrendingUp, FiAward, FiTrash2, FiEdit2 } from 'react-icons/fi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [analyticsData, usersData, coursesData] = await Promise.all([
          getPlatformAnalytics(),
          getAllUsers(),
          getAllCourses(),
        ]);
        setAnalytics(analyticsData);
        setUsers(usersData);
        setCourses(coursesData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="admin">
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
      <ProtectedRoute requiredRole="admin">
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
    <ProtectedRoute requiredRole="admin">
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          <p>Monitor and manage the entire platform</p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className={styles.statsGrid}>
            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon}>
                  <FiUsers />
                </div>
                <div>
                  <div className={styles.statLabel}>Total Users</div>
                  <div className={styles.statValue}>{analytics.totalUsers}</div>
                </div>
              </div>
            </Card>

            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon}>
                  <FiUsers />
                </div>
                <div>
                  <div className={styles.statLabel}>Students</div>
                  <div className={styles.statValue}>{analytics.totalStudents}</div>
                </div>
              </div>
            </Card>

            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon}>
                  <FiBook />
                </div>
                <div>
                  <div className={styles.statLabel}>Total Courses</div>
                  <div className={styles.statValue}>{analytics.totalCourses}</div>
                </div>
              </div>
            </Card>

            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon}>
                  <FiAward />
                </div>
                <div>
                  <div className={styles.statLabel}>Certificates</div>
                  <div className={styles.statValue}>{analytics.certificatesIssued || 0}</div>
                </div>
              </div>
            </Card>

            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon}>
                  <FiTrendingUp />
                </div>
                <div>
                  <div className={styles.statLabel}>Completion Rate</div>
                  <div className={styles.statValue}>{analytics.averageCompletion}%</div>
                </div>
              </div>
            </Card>

            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statIcon}>
                  <FiUsers />
                </div>
                <div>
                  <div className={styles.statLabel}>Instructors</div>
                  <div className={styles.statValue}>{analytics.totalInstructors}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* User Management */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>User Management</h2>
            <Button variant="primary">Add New User</Button>
          </div>

          <Card className={styles.tableCard}>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const normalizedRole = normalizeRole(u.role);
                    return (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[normalizedRole]}`}>
                            {normalizedRole}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.actionBtn} title="Edit">
                              <FiEdit2 />
                            </button>
                            <button className={styles.actionBtn} title="Delete">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Course Management */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Course Management</h2>
            <Button variant="primary">Approve Pending Courses</Button>
          </div>

          <div className={styles.coursesList}>
            {courses.map((course) => (
              <Card key={course.id} className={styles.courseItem}>
                <div className={styles.courseHeader}>
                  <div>
                    <h3>{course.title}</h3>
                    <p>{course.subject?.name || 'No subject'}</p>
                  </div>
                  <div className={styles.courseStats}>
                    <div className={styles.stat}>
                      <span className={styles.label}>Instructor:</span>
                      <span className={styles.value}>{course.instructor?.name || 'Unknown'}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Status:</span>
                      <span className={styles.value}>{course.isPublished ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.courseActions}>
                  <Button variant="outline" size="small">
                    View Details
                  </Button>
                  <Button variant="outline" size="small">
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button variant="danger" size="small">
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Platform Analytics */}
        <div className={styles.section}>
          <h2>Platform Analytics</h2>
          <div className={styles.analyticsGrid}>
            {analytics && (
              <>
                <Card className={styles.analyticsCard}>
                  <h3>Total Enrollments</h3>
                  <div className={styles.analyticsValue}>{analytics.totalEnrollments}</div>
                  <p>Students enrolled in courses</p>
                </Card>

                <Card className={styles.analyticsCard}>
                  <h3>Active Users</h3>
                  <div className={styles.analyticsValue}>{analytics.activeUsers}</div>
                  <p>Users active in last 30 days</p>
                </Card>

                <Card className={styles.analyticsCard}>
                  <h3>Instructors</h3>
                  <div className={styles.analyticsValue}>{analytics.totalInstructors}</div>
                  <p>Active course creators</p>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
