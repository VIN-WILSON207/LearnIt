'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { mockCourses, mockEnrollments, mockCertificates } from '@/lib/mockData';
import styles from './page.module.css';
import { FiAward, FiClock, FiBook } from 'react-icons/fi';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);

  useEffect(() => {
    if (user) {
      // Get student enrollments
      const studentEnrollments = mockEnrollments.filter(
        (e) => e.studentId === user.id
      );
      setEnrollments(studentEnrollments);

      // Calculate stats
      const hours = studentEnrollments.reduce((sum, e) => sum + e.hoursCompleted, 0);
      setTotalHours(hours);

      const completed = studentEnrollments.filter(
        (e) => e.status === 'completed'
      ).length;
      setCompletedCourses(completed);

      // Get certificates
      const studentCerts = mockCertificates.filter(
        (c) => c.studentId === user.id
      );
      setCertificates(studentCerts);
    }
  }, [user]);

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
                <FiClock />
              </div>
              <div>
                <div className={styles.statLabel}>Learning Hours</div>
                <div className={styles.statValue}>{totalHours}</div>
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
          <div className={styles.coursesGrid}>
            {enrollments.map((enrollment) => {
              const course = mockCourses.find((c) => c.id === enrollment.courseId);
              return (
                <Card key={enrollment.id} className={styles.courseCard}>
                  <img
                    src={course?.image}
                    alt={course?.title}
                    className={styles.courseImage}
                  />
                  <h3>{course?.title}</h3>
                  <p>{course?.description}</p>
                  <div className={styles.courseProgress}>
                    <div className={styles.progressLabel}>
                      Progress: {enrollment.progress}%
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                  <p className={styles.courseStats}>
                    {enrollment.hoursCompleted} / {course?.hours} hours
                  </p>
                  <Button variant="primary" className={styles.courseBtn}>
                    Continue Learning
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Certificates */}
        {certificates.length > 0 && (
          <div className={styles.section}>
            <h2>Your Certificates</h2>
            <div className={styles.certificatesList}>
              {certificates.map((cert) => {
                const course = mockCourses.find((c) => c.id === cert.courseId);
                return (
                  <Card key={cert.id} className={styles.certCard}>
                    <div className={styles.certContent}>
                      <FiAward className={styles.certIcon} />
                      <div>
                        <h3>{course?.title}</h3>
                        <p>Issued: {cert.issueDate}</p>
                        <p className={styles.certNumber}>
                          Cert #: {cert.certificateNumber}
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
