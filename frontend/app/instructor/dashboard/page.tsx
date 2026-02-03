'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getInstructorCourses, createCourse } from '@/lib/api/courses';
import { getEnrollments } from '@/lib/api/enrollments';
import { getRegistrationConfig, LevelWithSubjects } from '@/lib/api/auth';
import { BackendCourse } from '@/types';
import styles from './page.module.css';
import { FiUsers, FiBook, FiBarChart2, FiX } from 'react-icons/fi';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [levelsWithSubjects, setLevelsWithSubjects] = useState<LevelWithSubjects[]>([]);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createSubjectId, setCreateSubjectId] = useState('');
  const [createThumbnail, setCreateThumbnail] = useState<File | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const instructorCourses = await getInstructorCourses(user.id);
      setCourses(instructorCourses);
      setTotalCourses(instructorCourses.length);
      const allEnrollments = await getEnrollments();
      const studentIds = new Set<string>();
      instructorCourses.forEach((course) => {
        allEnrollments.forEach((enrollment) => {
          if (enrollment.courseId === course.id) {
            studentIds.add(enrollment.studentId);
          }
        });
      });
      setTotalStudents(studentIds.size);
    } catch (err) {
      console.error('Failed to fetch instructor data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (showCreateModal && levelsWithSubjects.length === 0) {
      getRegistrationConfig().then(setLevelsWithSubjects).catch(console.error);
    }
  }, [showCreateModal, levelsWithSubjects.length]);

  const allSubjects = levelsWithSubjects.flatMap((l) => l.subjects);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !createTitle.trim() || !createSubjectId) {
      setCreateError('Title and subject are required.');
      return;
    }
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      await createCourse({
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
        subjectId: createSubjectId,
        instructorId: user.id,
        thumbnail: createThumbnail || undefined,
      });
      setShowCreateModal(false);
      setCreateTitle('');
      setCreateDescription('');
      setCreateSubjectId('');
      setCreateThumbnail(null);
      await fetchData();
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create course. Please try again.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="instructor">
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
      <ProtectedRoute requiredRole="instructor">
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
    <ProtectedRoute requiredRole="instructor">
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
                <div className={styles.statLabel}>Published Courses</div>
                <div className={styles.statValue}>{courses.filter(c => c.isPublished).length}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Course Management */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>My Courses</h2>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>Create New Course</Button>
          </div>

          <div className={styles.coursesList}>
            {courses.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  <p>No courses yet. Create your first course to get started!</p>
                </div>
              </Card>
            ) : (
              courses.map((course) => (
                <Card key={course.id} className={styles.courseItem}>
                  {course.thumbnailUrl && (
                    <div className={styles.courseThumb}>
                      <img src={course.thumbnailUrl} alt="" className={styles.courseThumbImg} />
                    </div>
                  )}
                  <div className={styles.courseHeader}>
                    <div>
                      <h3>{course.title}</h3>
                      <p>{course.description || 'No description'}</p>
                    </div>
                    <div className={styles.courseStatus}>
                      <span className={`${styles.badge} ${course.isPublished ? styles.active : styles.pending}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.courseStats}>
                    <div className={styles.stat}>
                      <span className={styles.label}>Subject:</span>
                      <span className={styles.value}>{course.subject?.name || 'N/A'}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Lessons:</span>
                      <span className={styles.value}>{course.lessons?.length || 0}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Created:</span>
                      <span className={styles.value}>{new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className={styles.courseActions}>
                    <Button variant="outline">View Details</Button>
                    <Button variant="outline">Edit Course</Button>
                    <Button variant="outline">Upload Lesson</Button>
                  </div>
                </Card>
              ))
            )}
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

        {/* Create Course Modal */}
        {showCreateModal && (
          <div className={styles.modalOverlay} onClick={() => !createSubmitting && setShowCreateModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Create New Course</h2>
                <button type="button" className={styles.modalClose} onClick={() => !createSubmitting && setShowCreateModal(false)} aria-label="Close">
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleCreateCourse} className={styles.modalForm}>
                {createError && <p className={styles.modalError}>{createError}</p>}
                <label>
                  Title <span className={styles.required}>*</span>
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="Course title"
                    required
                    className={styles.input}
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder="Brief description"
                    rows={3}
                    className={styles.input}
                  />
                </label>
                <label>
                  Subject <span className={styles.required}>*</span>
                  <select
                    value={createSubjectId}
                    onChange={(e) => setCreateSubjectId(e.target.value)}
                    required
                    className={styles.input}
                  >
                    <option value="">Select subject</option>
                    {allSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Cover image (optional, stored in Cloudinary)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCreateThumbnail(e.target.files?.[0] ?? null)}
                    className={styles.input}
                  />
                </label>
                <div className={styles.modalActions}>
                  <Button type="button" variant="outline" onClick={() => !createSubmitting && setShowCreateModal(false)} disabled={createSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={createSubmitting}>
                    {createSubmitting ? 'Creating…' : 'Create Course'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
