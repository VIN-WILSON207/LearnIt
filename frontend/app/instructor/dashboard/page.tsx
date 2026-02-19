'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import styles from './page.module.css';
import { FiUsers, FiBook, FiBarChart2, FiMessageCircle, FiMenu, FiX } from 'react-icons/fi';

const TABS = ['Overview', 'Courses', 'Students', 'Analytics', 'Community', 'Support'] as const;
type Tab = (typeof TABS)[number];

export default function InstructorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [menuOpen, setMenuOpen] = useState(false);

  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threads, setThreads] = useState<any[] | null>(null);
  const [tickets, setTickets] = useState<any[] | null>(null);

  // Fetch courses and enrollments on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: token ? `Bearer ${token}` : '' };

        // Fetch courses
        const coursesRes = await fetch('/api/courses', { headers });
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          const normalizedCourses = (coursesData || []).map((c: any) => ({
            ...c,
            status: c.isPublished ? 'published' : 'pending',
            lessonsCount: c?._count?.lessons ?? c?.lessons?.length ?? 0,
          }));
          setCourses(normalizedCourses);
          setTotalCourses(normalizedCourses.length);
          setActiveCourses(normalizedCourses.filter((c: any) => c.isPublished).length);
        }

        // Fetch enrollments to count students
        const enrollmentsRes = await fetch(`/api/enrollments?instructorId=${user?.id || ''}`, { headers });
        if (enrollmentsRes.ok) {
          const enrollmentsData = await enrollmentsRes.json();
          setEnrollments(enrollmentsData || []);
          const studentIds = new Set<string>();
          (enrollmentsData || []).forEach((e: any) => studentIds.add(e.studentId));
          setTotalStudents(studentIds.size);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load data for specific tabs
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    const headers = { Authorization: token ? `Bearer ${token}` : '' };

    const loadTabData = async () => {
      try {
        if (activeTab === 'Community') {
          const res = await fetch('/api/forum', { headers });
          setThreads(res.ok ? await res.json() : []);
        }

        if (activeTab === 'Support') {
          // Support tab no longer loads data from API
          // Users go to dedicated support page
        }
      } catch (err) {
        console.error('Failed to load tab data', err);
      }
    };

    loadTabData();
  }, [activeTab, user]);

  const handleCreateCourse = () => {
    router.push('/instructor/create-course');
  };

  const handleViewCourse = (courseId?: string) => {
    if (courseId) router.push(`/instructor/courses/${courseId}`);
  };

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <Navbar />
      <div className={styles.instructorLayout}>
        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Mobile Overlay */}
        {menuOpen && (
          <div
            className={styles.mobileOverlay}
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.brand}>
            <span>Instructor</span>
          </div>
          <nav className={styles.navMenu}>
            {TABS.map(t => (
              <button
                key={t}
                className={`${styles.navItem} ${activeTab === t ? styles.active : ''}`}
                onClick={() => {
                  setActiveTab(t as Tab);
                  setMenuOpen(false);
                }}
              >
                {t}
              </button>
            ))}
          </nav>
          <div className={styles.sidebarFooter}>
            <div className={styles.userSummary}>{user?.name}</div>
            <div className={styles.roleBadge}>Instructor</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          <div className={styles.content}>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            {loading && <div>Loading...</div>}

            {/* Overview Tab */}
            {activeTab === 'Overview' && !loading && (
              <div>
                <div className={styles.headerRow}>
                  <div>
                    <h1>Welcome, {user?.name}!</h1>
                    <p className={styles.sub}>Manage your courses and track student progress</p>
                  </div>
                  <div className={styles.headerActions}>
                    <Button variant="primary" onClick={handleCreateCourse}>
                      Create New Course
                    </Button>
                  </div>
                </div>

                <div className={styles.statsGrid}>
                  <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                      <div className={styles.statIcon}><FiBook /></div>
                      <div>
                        <div className={styles.statLabel}>Courses Created</div>
                        <div className={styles.statValue}>{totalCourses}</div>
                      </div>
                    </div>
                  </Card>

                  <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                      <div className={styles.statIcon}><FiUsers /></div>
                      <div>
                        <div className={styles.statLabel}>Total Students</div>
                        <div className={styles.statValue}>{totalStudents}</div>
                      </div>
                    </div>
                  </Card>

                  <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                      <div className={styles.statIcon}><FiBarChart2 /></div>
                      <div>
                        <div className={styles.statLabel}>Active Courses</div>
                        <div className={styles.statValue}>{activeCourses}</div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className={styles.section}>
                  <h2>Recent Courses</h2>
                  <div className={styles.coursesList}>
                    {courses.length === 0 ? (
                      <Card><p>No courses yet. Start by creating your first course!</p></Card>
                    ) : (
                      courses.slice(0, 5).map((course) => (
                        <Card key={course.id} className={styles.courseItem}>
                          <div className={styles.courseHeader}>
                            <div>
                              <h3>{course.title}</h3>
                              <p>{course.description}</p>
                            </div>
                            <div className={styles.courseMeta}>
                              <span className={styles.courseBadge}>{course.isPublished ? 'published' : 'pending'}</span>
                            </div>
                          </div>
                          <div className={styles.courseStats}>
                            <span>{course.enrolledStudents || 0} Students</span>
                            <span>Lessons: {course.lessonsCount || 0}</span>
                          </div>
                          <Button variant="outline" size="small" onClick={() => handleViewCourse(course.id)}>
                            View Course
                          </Button>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'Courses' && !loading && (
              <div>
                <div className={styles.headerRow}>
                  <h1>My Courses</h1>
                  <div className={styles.headerActions}>
                    <Button variant="primary" onClick={handleCreateCourse}>
                      Create New Course
                    </Button>
                  </div>
                </div>

                <div className={styles.section}>
                  <div className={styles.coursesList}>
                    {courses.length === 0 ? (
                      <Card><p>No courses yet. Start by creating your first course!</p></Card>
                    ) : (
                      courses.map((course) => (
                        <Card key={course.id} className={styles.courseItem}>
                          <div className={styles.courseHeader}>
                            <div>
                              <h3>{course.title}</h3>
                              <p>{course.description}</p>
                            </div>
                            <div className={styles.courseMeta}>
                              <span className={styles.courseBadge}>{course.isPublished ? 'published' : 'pending'}</span>
                            </div>
                          </div>
                          <div className={styles.courseStats}>
                            <span>{course.enrolledStudents || 0} Students Enrolled</span>
                            <span>{course.lessonsCount || 0} Lessons</span>
                            <span>Rating: {course.rating || 'N/A'}</span>
                          </div>
                          <div className={styles.courseActions}>
                            <Button variant="outline" size="small" onClick={() => handleViewCourse(course.id)}>
                              View
                            </Button>
                            <Button variant="outline" size="small" onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}>
                              Edit
                            </Button>
                            <Button variant="outline" size="small" onClick={() => router.push(`/instructor/courses/${course.id}/analytics`)}>
                              Analytics
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'Students' && !loading && (
              <div>
                <div className={styles.headerRow}>
                  <h1>Students</h1>
                  <div className={styles.headerActions}>
                    <Button variant="outline">Export List</Button>
                  </div>
                </div>

                <Card className={styles.tableCard}>
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Course ID</th>
                          <th>Progress</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.length === 0 ? (
                          <tr><td colSpan={4}>No student enrollments yet</td></tr>
                        ) : (
                          enrollments.slice(0, 10).map((enrollment, idx) => (
                            <tr key={idx}>
                              <td>{enrollment.studentId}</td>
                              <td>{enrollment.courseId}</td>
                              <td>
                                <div className={styles.progressBar}>
                                  <div className={styles.progressFill} style={{ width: `${enrollment.progress}%` }}></div>
                                </div>
                              </td>
                              <td>
                                <Button variant="outline" size="small" onClick={() => window.open(`/instructor/students/${enrollment.studentId}`, '_blank')}>
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'Analytics' && !loading && (
              <div>
                <div className={styles.headerRow}>
                  <h1>Course Analytics</h1>
                  <div className={styles.headerActions}>
                    <Button variant="outline" onClick={() => alert('Export coming soon')}>Export Report</Button>
                  </div>
                </div>

                <div className={styles.section}>
                  <h2>Course Performance</h2>
                  <Card>
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <p>Analytics data will be displayed here</p>
                      <p style={{ fontSize: '0.9rem' }}>Connect your courses to view detailed performance metrics</p>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Community Tab */}
            {activeTab === 'Community' && !loading && (
              <div>
                <div className={styles.communityHeader}>
                  <div>
                    <h1>Community Forum</h1>
                    <p className={styles.communityDesc}>Engage with your students and peers</p>
                  </div>
                  <Button variant="primary" onClick={() => window.open('/instructor/forum', '_blank')}>
                    <FiMessageCircle style={{ marginRight: '0.5rem' }} />
                    Full Forum
                  </Button>
                </div>

                {threads && threads.length === 0 ? (
                  <Card><p>No recent discussions yet.</p></Card>
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
                          <Button size="small" onClick={() => window.open(`/forum/${t.id}`, '_blank')}>Reply</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'Support' && !loading && (
              <div>
                <div className={styles.headerRow}>
                  <h1>Need Help?</h1>
                </div>

                <Card className={styles.tableCard}>
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
                      Facing issues or have questions? Our support team is here to help you.
                    </p>
                    <p style={{ fontSize: '14px', color: '#999', marginBottom: '20px' }}>
                      Send us a message and we'll get back to you as soon as possible.
                    </p>
                    <Button variant="primary" onClick={() => window.open('/support', '_blank')} style={{ padding: '10px 30px', fontSize: '16px' }}>
                      Contact Support Team
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
