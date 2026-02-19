
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { FiAward, FiClock, FiBook, FiMessageCircle } from 'react-icons/fi';
import { StudentLayout } from '@/components/StudentLayout';

const TABS = ['Overview', 'Courses', 'Progress', 'Certificates', 'Subscriptions', 'Community', 'Support'] as const;
type Tab = (typeof TABS)[number];

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
              <div className={styles.headerActions}>
                <Button variant="outline" onClick={handleExportPdf}>
                  Export PDF
                </Button>
                <Button variant="primary" onClick={() => setActiveTab('Progress')}>
                  Go to Progress
                </Button>
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'Overview' && (
              <div>
                <div className={styles.statsGrid}>
                  <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                      <div className={styles.statIcon}><FiClock /></div>
                      <div>
                        <div className={styles.statLabel}>Learning Hours</div>
                        <div className={styles.statValue}>{totalHours}</div>
                      </div>
                    </div>
                  </Card>

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
                  </Card>

                  <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                      <div className={styles.statIcon}><FiBook /></div>
                      <div>
                        <div className={styles.statLabel}>Courses Completed</div>
                        <div className={styles.statValue}>{completedCourses}</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'Certificates' && (
              <div className={styles.section}>
                <h2>Your Certificates</h2>
                <div className={styles.certificatesList}>
                  {certificates.map((cert) => (
                    <Card key={cert.id} className={styles.certCard}>
                      <div className={styles.certContent}>
                        <FiAward className={styles.certIcon} />
                        <div>
                          <h3>{cert.courseName || 'Course Certificate'}</h3>
                          <p>Issued: {cert.issueDate}</p>
                          <p className={styles.certNumber}>Cert #: {cert.certificateNumber}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadCertificate(cert.id)}
                      >
                        Download Certificate
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'Subscriptions' && (
              <div className={styles.section}>
                <h2>Subscriptions</h2>
                <Card className={styles.tableCard}>
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.1rem', color: '#4B5563', marginBottom: '1.5rem' }}>
                      Upgrade your plan to unlock more features and resources!
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => router.push('/student/subscription')}
                      style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                    >
                      View Subscription Plans
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Community Tab */}
            {activeTab === 'Community' && (
              <div className={styles.section}>
                <div className={styles.communityHeader}>
                  <div>
                    <h2>Community Forum</h2>
                    <p className={styles.communityDesc}>Connect with peers and instructors across all courses</p>
                  </div>
                  <Button variant="primary" onClick={() => window.open('/student/forum', '_blank')}>
                    <FiMessageCircle style={{ marginRight: '0.5rem' }} />
                    Full Forum
                  </Button>
                </div>

                {threads && threads.length === 0 ? (
                  <Card>
                    <p>No recent discussions. Start a conversation in the <strong>Full Forum</strong>!</p>
                  </Card>
                ) : (
                  <div className={styles.recentThreads}>
                    {threads && threads.slice(0, 5).map((t) => (
                      <Card key={t.id} className={styles.threadPreview}>
                        <div className={styles.threadPreviewHeader}>
                          <h4>{t.title}</h4>
                          <span className={styles.threadAuthor}>by {t.author}</span>
                        </div>
                        <p className={styles.threadPreviewContent}>{t.content?.substring(0, 100)}...</p>
                        <div className={styles.threadPreviewFooter}>
                          <small className={styles.threadDate}>{t.createdDate || 'Recently'}</small>
                          <Button size="small" onClick={() => window.open(`/forum/${t.id}`, '_blank')}>View</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'Support' && (
              <div className={styles.section}>
                <h2>Need Help?</h2>
                <Card className={styles.tableCard}>
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
                      Facing issues or have questions? Our support team is here to help you.
                    </p>
                    <p style={{ fontSize: '14px', color: '#999', marginBottom: '20px' }}>
                      Send us a message and we'll get back to you as soon as possible.
                    </p>
                    <Button onClick={() => window.open('/support', '_blank')} style={{ padding: '10px 30px', fontSize: '16px' }}>
                      Contact Support Team
                    </Button>
                  </div>
                </Card>
              </div>
            )}

        </div>
      </StudentLayout>
    </ProtectedRoute>
  );
}
