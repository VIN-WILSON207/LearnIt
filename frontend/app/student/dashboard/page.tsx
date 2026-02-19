
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import styles from './page.module.css';
import { FiAward, FiClock, FiBook, FiMessageCircle } from 'react-icons/fi';
import { StudentLayout } from '@/components/StudentLayout';

const TABS = ['Overview', 'Courses', 'Progress', 'Certificates', 'Subscriptions', 'Community', 'Support'] as const;
type Tab = (typeof TABS)[number];

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [subscriptions, setSubscriptions] = useState<any[] | null>(null);
  const [threads, setThreads] = useState<any[] | null>(null);
  const [tickets, setTickets] = useState<any[] | null>(null);
  const [availableCourses, setAvailableCourses] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch enrollments
    const fetchEnrollments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/enrollments?studentId=${user.id}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        if (res.ok) {
          setEnrollments(await res.json());
        }
      } catch (err) {
        console.error('Failed to load enrollments', err);
      }
    };

    // Fetch certificates
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/certificates', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        if (res.ok) {
          setCertificates(await res.json());
        }
      } catch (err) {
        console.error('Failed to load certificates', err);
      }
    };

    fetchEnrollments();
    fetchCertificates();
  }, [user]);

  // Load data for subscriptions, community and support when those tabs are active
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');

    const load = async () => {
      try {
        if (activeTab === 'Overview') {
          const res = await fetch('/api/courses', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
          setAvailableCourses(res.ok ? await res.json() : []);
        }

        if (activeTab === 'Subscriptions') {
          const res = await fetch('/api/subscriptions', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
          setSubscriptions(res.ok ? await res.json() : []);
        }

        if (activeTab === 'Community') {
          const res = await fetch('/api/forum', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
          setThreads(res.ok ? await res.json() : []);
        }

        if (activeTab === 'Support') {
        }
      } catch (err) {
        console.error('Failed to load student tab data', err);
      }
    };

    load();
  }, [activeTab, user]);

  const handleContinue = (courseId?: string) => {
    if (courseId) window.open(`/courses/${courseId}`, '_blank');
  };

  const handleDownloadCertificate = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ action: 'download', id })
      });

      if (res.ok) {
        const { downloadUrl } = await res.json();
        window.open(downloadUrl, '_blank');
      } else {
        const error = await res.json();
        if (res.status === 403 && error.code === 'SUBSCRIPTION_REQUIRED') {
          if (confirm('A subscription is required to download certificates. Would you like to view plans?')) {
            router.push('/student/subscription');
          }
        } else {
          alert(error.error || 'Failed to download certificate');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error downloading certificate');
    }
  };

  const handleTakeCourse = async (courseId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ courseId, studentId: user.id }),
      });
      if (res.ok) {
        const newEnrollment = await res.json();
        setEnrollments([...enrollments, newEnrollment]);
        alert('Course enrolled successfully!');
      } else {
        alert('Failed to enroll in course');
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      alert('Error enrolling in course');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    if (!user) return;

    const enrolledCount = enrollments.length;
    const certificateCount = certificates.length;
    const courseRows = enrollments
      .map((enrollment) => {
        const course = availableCourses?.find((c: any) => c.id === enrollment.courseId);
        const title = course?.title || `Course ${enrollment.courseId}`;
        const progress = enrollment.progress ?? 0;
        const hours = `${enrollment.hoursCompleted ?? 0} / ${course?.hours ?? 0}`;
        return `<tr><td>${title}</td><td>${progress}%</td><td>${hours}</td></tr>`;
      })
      .join('');

    const certificateRows = certificates
      .map((cert) => {
        const title = cert.courseName || 'Course Certificate';
        const issueDate = cert.issueDate || 'N/A';
        const certNumber = cert.certificateNumber || cert.id || 'N/A';
        return `<tr><td>${title}</td><td>${issueDate}</td><td>${certNumber}</td></tr>`;
      })
      .join('');

    const printable = window.open('', '_blank', 'width=900,height=700');
    if (!printable) return;

    printable.document.write(`
      <html>
        <head>
          <title>LearnIT Student Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin-bottom: 8px; }
            .meta { color: #555; margin-bottom: 24px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
            .label { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
            .value { font-size: 20px; font-weight: 600; margin-top: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 14px; }
            th { background: #f9fafb; }
            .section { margin-top: 24px; }
          </style>
        </head>
        <body>
          <h1>Student Progress Report</h1>
          <div class="meta">
            <div><strong>Name:</strong> ${user.name}</div>
            <div><strong>Email:</strong> ${user.email}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="label">Learning Hours</div>
              <div class="value">${totalHours}</div>
            </div>
            <div class="card">
              <div class="label">Courses Completed</div>
              <div class="value">${completedCourses}</div>
            </div>
            <div class="card">
              <div class="label">Certificates Earned</div>
              <div class="value">${certificateCount}</div>
            </div>
          </div>

          <div class="section">
            <h2>Enrolled Courses (${enrolledCount})</h2>
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Progress</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                ${courseRows || '<tr><td colspan="3">No enrollments yet.</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Certificates (${certificateCount})</h2>
            <table>
              <thead>
                <tr>
                  <th>Certificate</th>
                  <th>Issued</th>
                  <th>Certificate #</th>
                </tr>
              </thead>
              <tbody>
                ${certificateRows || '<tr><td colspan="3">No certificates yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);

    printable.document.close();
    printable.focus();
    printable.print();
  };

  return (
    <ProtectedRoute requiredRole="student">
      <Navbar />
      <StudentLayout active="dashboard">
        <div className={styles.content}>
            {/* Header */}
            <div className={styles.headerRow}>
              <div>
                <h1>Welcome, {user?.name}!</h1>
                <p className={styles.sub}>
                  Track your learning progress and explore new courses
                </p>
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

                  <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                      <div className={styles.statIcon}><FiBook /></div>
                      <div>
                        <div className={styles.statLabel}>Courses Completed</div>
                        <div className={styles.statValue}>{completedCourses}</div>
                      </div>
                    </div>
                  </Card>

                  <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                      <div className={styles.statIcon}><FiAward /></div>
                      <div>
                        <div className={styles.statLabel}>Certificates Earned</div>
                        <div className={styles.statValue}>{certificates.length}</div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className={styles.section}>
                  <h2>Available Courses</h2>
                  <div className={styles.coursesGrid}>
                    {availableCourses && availableCourses.length === 0 && <Card><p>No courses available</p></Card>}
                    {availableCourses && availableCourses.map((course) => {
                      const isEnrolled = enrollments.some(e => e.courseId === course.id);
                      return (
                        <Card key={course.id} className={styles.courseCard}>
                          <img src={course.image} alt={course.title} className={styles.courseImage} />
                          <h3>{course.title}</h3>
                          <p>{course.description}</p>
                          <p className={styles.courseStats}>Instructor: {course.instructorName || 'Unknown'}</p>
                          <p className={styles.courseStats}>{course.hours || 0} hours</p>
                          <Button
                            variant={isEnrolled ? 'outline' : 'primary'}
                            className={styles.courseBtn}
                            onClick={() => isEnrolled ? setActiveTab('Courses') : handleTakeCourse(course.id)}
                            disabled={loading}
                          >
                            {isEnrolled ? 'Already Enrolled' : 'Take Course'}
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'Courses' && (
              <div className={styles.section}>
                <h2>Your Courses</h2>
                <div className={styles.coursesGrid}>
                  {enrollments?.length === 0 ? (
                    <Card><p>You haven't enrolled in any courses yet. Check the Overview tab for available courses!</p></Card>
                  ) : (
                    enrollments?.map((enrollment) => {
                      const course = availableCourses?.find((c: any) => c.id === enrollment.courseId);
                      return (
                        <Card key={enrollment.id} className={styles.courseCard}>
                          <img src={course?.image || '/images/course-placeholder.png'} alt={course?.title || 'Course'} className={styles.courseImage} />
                          <h3>{course?.title || `Course ${enrollment.courseId}`}</h3>
                          <p>{course?.description || ''}</p>

                          <div className={styles.courseProgress}>
                            <div className={styles.progressLabel}>Progress: {enrollment.progress}%</div>
                            <div className={styles.progressBar}>
                              <div
                                className={styles.progressFill}
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                          </div>

                          <p className={styles.courseStats}>
                            {enrollment.hoursCompleted} / {course?.hours || 0} hours
                          </p>

                          <Button
                            variant="primary"
                            className={styles.courseBtn}
                            onClick={() => handleContinue(course?.id)}
                          >
                            Continue Learning
                          </Button>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'Progress' && (
              <div className={styles.section}>
                <h2>Your Progress</h2>
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
