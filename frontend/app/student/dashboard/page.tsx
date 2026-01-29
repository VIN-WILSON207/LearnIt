'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getStudentEnrollments } from '@/lib/api/enrollments';
import { getUserProgress } from '@/lib/api/progress';
import { getCertificates } from '@/lib/api/certificates';
import { getCourseById } from '@/lib/api/courses';
import { Enrollment, Certificate, Progress, BackendCourse } from '@/types';
import styles from './page.module.css';
import { FiAward, FiClock, FiBook } from 'react-icons/fi';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [courses, setCourses] = useState<Record<string, BackendCourse>>({});
  const [totalCourses, setTotalCourses] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      try {
        // Fetch all data in parallel
        const [enrollmentsData, certificatesData, progressData] = await Promise.all([
          getStudentEnrollments(user.id),
          getCertificates(),
          getUserProgress(),
        ]);

        setEnrollments(enrollmentsData);
        setCertificates(certificatesData);
        setProgressData(progressData);

        // Fetch course details for enrollments
        const coursePromises = enrollmentsData.map((enrollment) =>
          getCourseById(enrollment.courseId).catch(() => null)
        );
        const courseResults = await Promise.all(coursePromises);
        const coursesMap: Record<string, BackendCourse> = {};
        courseResults.forEach((course, index) => {
          if (course) {
            coursesMap[enrollmentsData[index].courseId] = course;
          }
        });
        setCourses(coursesMap);

        // Calculate stats
        setTotalCourses(enrollmentsData.length);
        const completed = progressData.filter((p) => p.percent >= 100).length;
        setCompletedCourses(completed);
      } catch (err) {
        console.error('Failed to fetch student data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="student">
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
      <ProtectedRoute requiredRole="student">
        <Navbar />
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--error)' }}>
            <p>{error}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Get progress for each enrollment
  const getProgressForCourse = (courseId: string): number => {
    const progress = progressData.find((p) => p.courseId === courseId);
    return progress?.percent || 0;
  };

  return (
    <ProtectedRoute requiredRole="student">
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Welcome, {user?.name}!</h1>
          <p>Track your learning progress and explore new courses</p>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <FiBook />
              </div>
              <div>
                <div className={styles.statLabel}>Enrolled Courses</div>
                <div className={styles.statValue}>{totalCourses}</div>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <FiBook />
              </div>
              <div>
                <div className={styles.statLabel}>Courses Completed</div>
                <div className={styles.statValue}>{completedCourses}</div>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <FiAward />
              </div>
              <div>
                <div className={styles.statLabel}>Certificates Earned</div>
                <div className={styles.statValue}>{certificates.length}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* In Progress Courses */}
        <div className={styles.section}>
          <h2>Your Courses</h2>
          {enrollments.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <p>You haven't enrolled in any courses yet. Browse courses to get started!</p>
              </div>
            </Card>
          ) : (
            <div className={styles.coursesGrid}>
              {enrollments.map((enrollment) => {
                const course = courses[enrollment.courseId];
                const progress = getProgressForCourse(enrollment.courseId);
                if (!course) return null;

                return (
                  <Card key={enrollment.id} className={styles.courseCard}>
                    <h3>{course.title}</h3>
                    <p>{course.description || 'No description'}</p>
                    <div className={styles.courseProgress}>
                      <div className={styles.progressLabel}>
                        Progress: {progress}%
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <p className={styles.courseStats}>
                      Subject: {course.subject?.name || 'N/A'}
                    </p>
                    <Button variant="primary" className={styles.courseBtn}>
                      Continue Learning
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Certificates */}
        {certificates.length > 0 && (
          <div className={styles.section}>
            <h2>Your Certificates</h2>
            <div className={styles.certificatesList}>
              {certificates.map((cert) => {
                const course = courses[cert.courseId] || cert.course;
                return (
                  <Card key={cert.id} className={styles.certCard}>
                    <div className={styles.certContent}>
                      <FiAward className={styles.certIcon} />
                      <div>
                        <h3>{course?.title || 'Course'}</h3>
                        <p>Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                        <p className={styles.certNumber}>
                          Cert ID: {cert.id.substring(0, 8)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">View Certificate</Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
