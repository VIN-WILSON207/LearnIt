'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { getStudentsByInstructor, InstructorEnrollment } from '@/lib/api/enrollments';
import styles from './page.module.css';
import { FiUsers } from 'react-icons/fi';

export default function InstructorStudentsPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<InstructorEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStudentsByInstructor(user.id);
        setEnrollments(data);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setError('Failed to load students. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const uniqueStudents = Array.from(
    new Map(enrollments.map((e) => [e.student.id, e.student])).values()
  );

  return (
    <ProtectedRoute requiredRole="instructor">
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Students</h1>
          <p>Students enrolled in your courses</p>
        </div>

        {isLoading && (
          <div className={styles.loading}>
            <p>Loading students...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className={styles.stats}>
              <Card className={styles.statCard}>
                <FiUsers size={24} />
                <div>
                  <span className={styles.statValue}>{uniqueStudents.length}</span>
                  <span className={styles.statLabel}>Unique students</span>
                </div>
              </Card>
              <Card className={styles.statCard}>
                <span className={styles.statValue}>{enrollments.length}</span>
                <span className={styles.statLabel}>Total enrollments</span>
              </Card>
            </div>

            <Card className={styles.tableCard}>
              {enrollments.length === 0 ? (
                <div className={styles.empty}>
                  <FiUsers size={48} />
                  <p>No students enrolled in your courses yet.</p>
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Course</th>
                        <th>Enrolled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((e) => (
                        <tr key={e.id}>
                          <td>{e.student.name}</td>
                          <td>{e.student.email}</td>
                          <td>{e.course.title}</td>
                          <td>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
