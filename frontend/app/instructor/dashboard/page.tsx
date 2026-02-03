'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import { getInstructorCourses, createCourse, uploadLesson } from '@/lib/api/courses';
import { getQuiz, submitQuiz } from '@/lib/api/quizzes'; // Note: Need a createQuiz api
import { getEnrollments } from '@/lib/api/enrollments';
import { getRegistrationConfig, LevelWithSubjects } from '@/lib/api/auth';
import { BackendCourse } from '@/types';
import styles from './page.module.css';
import { FiUsers, FiBook, FiBarChart2, FiX, FiPlus, FiVideo, FiFileText } from 'react-icons/fi';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
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
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Lesson modal states
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideo, setLessonVideo] = useState<File | null>(null);
  const [lessonSubmitting, setLessonSubmitting] = useState(false);

  // Quiz modal states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [passMark, setPassMark] = useState(70);
  const [quizQuestions, setQuizQuestions] = useState([{ text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

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
      if (editingCourseId) {
        // We'll need an updateCourse API function, but for now we'll assume createCourse can handle updates if ID is provided or just implement partial update
        // Since the backend 'POST /' is for new courses, we typically need a 'PATCH /:id'
        // For now, let's assume we need to add updateCourse to lib/api/courses
        const { updateCourse } = await import('@/lib/api/courses');
        await updateCourse(editingCourseId, {
          title: createTitle.trim(),
          description: createDescription.trim(),
          subjectId: createSubjectId,
          thumbnail: createThumbnail || undefined,
        });
      } else {
        await createCourse({
          title: createTitle.trim(),
          description: createDescription.trim() || undefined,
          subjectId: createSubjectId,
          instructorId: user.id,
          thumbnail: createThumbnail || undefined,
        });
      }
      setShowCreateModal(false);
      resetCreateForm();
      await fetchData();
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create course. Please try again.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleUploadLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourseId || !lessonTitle.trim()) return;
    setLessonSubmitting(true);
    try {
      const course = courses.find(c => c.id === activeCourseId);
      const nextOrder = (course?.lessons?.length || 0) + 1;
      await uploadLesson({
        courseId: activeCourseId,
        title: lessonTitle.trim(),
        content: lessonContent.trim() || undefined,
        video: lessonVideo || undefined,
        orderNumber: nextOrder,
        isFree: false
      });
      setShowLessonModal(false);
      setLessonTitle('');
      setLessonContent('');
      setLessonVideo(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload lesson');
    } finally {
      setLessonSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setCreateTitle('');
    setCreateDescription('');
    setCreateSubjectId('');
    setCreateThumbnail(null);
    setEditingCourseId(null);
  };

  const openEditModal = (course: BackendCourse) => {
    setEditingCourseId(course.id);
    setCreateTitle(course.title);
    setCreateDescription(course.description || '');
    setCreateSubjectId(course.subjectId);
    setCreateThumbnail(null); // Reset thumbnail as we don't handle editing existing one here
    setShowCreateModal(true);
  };

  const openLessonModal = (courseId: string) => {
    setActiveCourseId(courseId);
    setShowLessonModal(true);
  };

  const openQuizModal = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setShowQuizModal(true);
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLessonId) return;
    setQuizSubmitting(true);
    try {
      // API call to create quiz (assumed to exist or will be added)
      // await createQuiz({ lessonId: activeLessonId, passMark, questions: quizQuestions });
      alert('Quiz creation API not fully implemented in backend yet, but UI is ready!');
      setShowQuizModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create quiz');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, { text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]);
  };

  const updateQuestion = (index: number, text: string) => {
    const newQs = [...quizQuestions];
    newQs[index].text = text;
    setQuizQuestions(newQs);
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
                      <img
                        src={course.thumbnailUrl}
                        alt=""
                        className={styles.courseThumbImg}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://placehold.co/400x225?text=No+Preview';
                        }}
                      />
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
                    <Button variant="outline" onClick={() => router.push(`/student/courses/${course.id}`)}>View Details</Button>
                    <Button variant="outline" onClick={() => openEditModal(course)}>Edit Course</Button>
                    <Button variant="outline" onClick={() => openLessonModal(course.id)}>
                      <FiPlus /> Upload Lesson
                    </Button>
                    {course.lessons && course.lessons.length > 0 && (
                      <div className={styles.courseLessonsList}>
                        <h4>Lessons</h4>
                        {course.lessons.map(l => (
                          <div key={l.id} className={styles.miniLessonItem}>
                            <span>{l.title}</span>
                            <Button size="small" variant="outline" onClick={() => openQuizModal(l.id)}>
                              Add Quiz
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Lesson Upload Modal */}
        {showLessonModal && (
          <div className={styles.modalOverlay} onClick={() => !lessonSubmitting && setShowLessonModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Upload New Lesson</h2>
                <button className={styles.modalClose} onClick={() => setShowLessonModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleUploadLesson} className={styles.modalForm}>
                <label>
                  Lesson Title <span className={styles.required}>*</span>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    required
                    className={styles.input}
                  />
                </label>
                <label>
                  Content (Markdown/HTML)
                  <textarea
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    rows={5}
                    className={styles.input}
                  />
                </label>
                <label>
                  Video File
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setLessonVideo(e.target.files?.[0] || null)}
                    className={styles.input}
                  />
                </label>
                <div className={styles.modalActions}>
                  <Button type="button" variant="outline" onClick={() => setShowLessonModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" disabled={lessonSubmitting}>
                    {lessonSubmitting ? 'Uploading...' : 'Upload Lesson'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                <h2>{editingCourseId ? 'Edit Course' : 'Create New Course'}</h2>
                <button type="button" className={styles.modalClose} onClick={() => !createSubmitting && (setShowCreateModal(false), resetCreateForm())} aria-label="Close">
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
        {/* Quiz Creation Modal */}
        {showQuizModal && (
          <div className={styles.modalOverlay} onClick={() => !quizSubmitting && setShowQuizModal(false)}>
            <div className={styles.modal} style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Create Lesson Quiz</h2>
                <button className={styles.modalClose} onClick={() => setShowQuizModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleCreateQuiz} className={styles.modalForm}>
                <label>
                  Pass Mark (%)
                  <input
                    type="number"
                    value={passMark}
                    onChange={(e) => setPassMark(parseInt(e.target.value))}
                    className={styles.input}
                    min="1"
                    max="100"
                  />
                </label>

                <div className={styles.questionsSetup}>
                  <h3>Questions</h3>
                  {quizQuestions.map((q, qIdx) => (
                    <div key={qIdx} className={styles.questionFormItem} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <input
                        placeholder={`Question ${qIdx + 1}`}
                        value={q.text}
                        onChange={(e) => updateQuestion(qIdx, e.target.value)}
                        className={styles.input}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Note: Option editing UI can be expanded here.</p>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addQuestion}>
                    <FiPlus /> Add Question
                  </Button>
                </div>

                <div className={styles.modalActions}>
                  <Button type="button" variant="outline" onClick={() => setShowQuizModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" disabled={quizSubmitting}>
                    {quizSubmitting ? 'Creating...' : 'Create Quiz'}
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
