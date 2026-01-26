'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { mockCourses, mockEnrollments } from '@/lib/mockData';
import styles from './page.module.css';
import { FiUsers, FiBook, FiBarChart2 } from 'react-icons/fi';

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);

  useEffect(() => {
    // Get professor's courses
    const profCourses = mockCourses;
    setCourses(profCourses);
    setTotalCourses(profCourses.length);

    // Count unique students
    const studentIds = new Set<string>();
    mockEnrollments.forEach((enrollment) => {
      studentIds.add(enrollment.studentId);
    });
    setTotalStudents(studentIds.size);
  }, []);

  return (
    <ProtectedRoute requiredRole="professor">
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
                <div className={styles.statLabel}>Active Courses</div>
                <div className={styles.statValue}>{courses.filter(c => c.status === 'active').length}</div>
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
            {courses.map((course) => (
              <Card key={course.id} className={styles.courseItem}>
                <div className={styles.courseHeader}>
                  <div>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                  </div>
                  <div className={styles.courseStatus}>
                    <span className={`${styles.badge} ${styles[course.status]}`}>
                      {course.status}
                    </span>
                  </div>
                </div>

                <div className={styles.courseStats}>
                  <div className={styles.stat}>
                    <span className={styles.label}>Level:</span>
                    <span className={styles.value}>{course.level}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>Duration:</span>
                    <span className={styles.value}>{course.duration}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>Students:</span>
                    <span className={styles.value}>{course.students}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>Rating:</span>
                    <span className={styles.value}>⭐ {course.rating}</span>
                  </div>
                </div>

                <div className={styles.courseActions}>
                  <Button variant="outline">View Students</Button>
                  <Button variant="outline">Edit Course</Button>
                  <Button variant="outline">Upload Materials</Button>
                </div>
              </Card>
            ))}
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
