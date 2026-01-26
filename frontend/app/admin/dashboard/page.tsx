'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { mockAnalytics, mockUsers, mockCourses } from '@/lib/mockData';
import styles from './page.module.css';
import { FiUsers, FiBook, FiTrendingUp, FiAward, FiTrash2, FiEdit2 } from 'react-icons/fi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(mockAnalytics);

  return (
    <ProtectedRoute requiredRole="admin">
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          <p>Monitor and manage the entire platform</p>
        </div>

        {/* Analytics Cards */}
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
                <div className={styles.statValue}>{analytics.certificatesIssued}</div>
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
                <div className={styles.statValue}>{analytics.completionRate}%</div>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <FiTrendingUp />
              </div>
              <div>
                <div className={styles.statLabel}>Avg Rating</div>
                <div className={styles.statValue}>⭐ {analytics.averageRating}</div>
              </div>
            </div>
          </Card>
        </div>

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
                  {mockUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.fullName}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[u.role]}`}>
                          {u.role}
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
                  ))}
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
            {mockCourses.map((course) => (
              <Card key={course.id} className={styles.courseItem}>
                <div className={styles.courseHeader}>
                  <div>
                    <h3>{course.title}</h3>
                    <p>{course.category}</p>
                  </div>
                  <div className={styles.courseStats}>
                    <div className={styles.stat}>
                      <span className={styles.label}>Students:</span>
                      <span className={styles.value}>{course.students}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Rating:</span>
                      <span className={styles.value}>⭐ {course.rating}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.courseActions}>
                  <Button variant="outline" size="small">
                    View Details
                  </Button>
                  <Button variant="outline" size="small">
                    Approve
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
            <Card className={styles.analyticsCard}>
              <h3>Learning Activity</h3>
              <div className={styles.analyticsValue}>
                {analytics.totalHours.toLocaleString()} hours
              </div>
              <p>Total learning hours on platform</p>
            </Card>

            <Card className={styles.analyticsCard}>
              <h3>Active Courses</h3>
              <div className={styles.analyticsValue}>{analytics.activeCourses}</div>
              <p>Out of {analytics.totalCourses} total courses</p>
            </Card>

            <Card className={styles.analyticsCard}>
              <h3>Professors</h3>
              <div className={styles.analyticsValue}>{analytics.totalInstructors}</div>
              <p>Active course creators</p>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
