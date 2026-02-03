'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getPlatformAnalytics } from '@/lib/api/analytics';
import { createUser, getAllUsers, updateUser, deleteUser, CreateUserRequest } from '@/lib/api/users';
import { getAllCourses, publishCourse, unpublishCourse, deleteCourse } from '@/lib/api/courses';
import { getRegistrationConfig, LevelWithSubjects } from '@/lib/api/auth';
import { normalizeRole } from '@/lib/apiClient';
import { BackendUser, BackendCourse, PlatformAnalytics } from '@/types';
import styles from './page.module.css';
import { FiUsers, FiBook, FiTrendingUp, FiAward, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';

type ViewMode = 'overview' | 'users' | 'courses' | 'analytics';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<BackendUser | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('STUDENT');
  const [userLevelId, setUserLevelId] = useState('');
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [levelsWithSubjects, setLevelsWithSubjects] = useState<LevelWithSubjects[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analyticsData, usersData, coursesData] = await Promise.all([
        getPlatformAnalytics(),
        getAllUsers(),
        getAllCourses(),
      ]);
      setAnalytics(analyticsData);
      setUsers(usersData);
      setCourses(coursesData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Map URL hash to view mode so Navbar internal links work
  useEffect(() => {
    const mapHashToView = (hash: string) => {
      switch (hash.replace('#', '')) {
        case 'overview': return 'overview';
        case 'users': return 'users';
        case 'courses': return 'courses';
        case 'analytics': return 'analytics';
        default: return null;
      }
    };

    const setFromHash = () => {
      if (typeof window === 'undefined') return;
      const vm = mapHashToView(window.location.hash);
      if (vm) setViewMode(vm as ViewMode);
    };

    setFromHash();
    window.addEventListener('hashchange', setFromHash);
    return () => window.removeEventListener('hashchange', setFromHash);
  }, []);

  // Scroll to section when viewMode changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(viewMode);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [viewMode]);

  useEffect(() => {
    if (showUserModal && levelsWithSubjects.length === 0) {
      getRegistrationConfig().then(setLevelsWithSubjects).catch(console.error);
    }
  }, [showUserModal, levelsWithSubjects.length]);

  const handlePublishCourse = async (courseId: string) => {
    try {
      await publishCourse(courseId);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to publish course:', err);
      alert(err?.message || 'Failed to publish course');
    }
  };

  const handleUnpublishCourse = async (courseId: string) => {
    try {
      await unpublishCourse(courseId);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to unpublish course:', err);
      alert(err?.message || 'Failed to unpublish course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteCourse(courseId);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to delete course:', err);
      alert(err?.message || 'Failed to delete course');
    }
  };

  const openAddUserModal = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole('STUDENT');
    setUserLevelId('');
    setUserError(null);
    setShowUserModal(true);
  };

  const openEditUserModal = (userToEdit: BackendUser) => {
    setEditingUser(userToEdit);
    setUserName(userToEdit.name);
    setUserEmail(userToEdit.email);
    setUserPassword(''); // Don't pre-fill password
    setUserRole(userToEdit.role);
    setUserLevelId(userToEdit.level?.id || '');
    setUserError(null);
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      setUserError('Name and email are required');
      return;
    }
    if (!editingUser && !userPassword.trim()) {
      setUserError('Password is required for new users');
      return;
    }

    setUserSubmitting(true);
    setUserError(null);

    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          name: userName.trim(),
          email: userEmail.trim(),
          role: userRole,
          levelId: userLevelId || null,
        };
        if (userPassword.trim()) {
          updateData.password = userPassword.trim();
        }
        await updateUser(editingUser.id, updateData);
      } else {
        // Create new user
        const createData: CreateUserRequest = {
          name: userName.trim(),
          email: userEmail.trim(),
          password: userPassword.trim(),
          role: userRole,
          levelId: userLevelId || undefined,
        };
        await createUser(createData);
      }
      setShowUserModal(false);
      await fetchData();
    } catch (err: any) {
      setUserError(err?.message || `Failed to ${editingUser ? 'update' : 'create'} user`);
    } finally {
      setUserSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteUser(userId);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err?.message || 'Failed to delete user');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="admin">
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
      <ProtectedRoute requiredRole="admin">
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
    <ProtectedRoute requiredRole="admin">
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          <p>Monitor and manage the entire platform</p>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${viewMode === 'overview' ? styles.active : ''}`}
            onClick={() => { setViewMode('overview'); window.location.hash = '#overview'; }}
          >
            Overview
          </button>
          <button
            className={`${styles.tab} ${viewMode === 'users' ? styles.active : ''}`}
            onClick={() => { setViewMode('users'); window.location.hash = '#users'; }}
          >
            Users ({users.length})
          </button>
          <button
            className={`${styles.tab} ${viewMode === 'courses' ? styles.active : ''}`}
            onClick={() => { setViewMode('courses'); window.location.hash = '#courses'; }}
          >
            Courses ({courses.length})
          </button>
          <button
            className={`${styles.tab} ${viewMode === 'analytics' ? styles.active : ''}`}
            onClick={() => { setViewMode('analytics'); window.location.hash = '#analytics'; }}
          >
            Analytics
          </button>
        </div>

        {/* Overview View */}
        {viewMode === 'overview' && (
          <div id="overview">
            {/* Analytics Cards */}
            {analytics && (
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
                      <FiTrendingUp />
                    </div>
                    <div>
                      <div className={styles.statLabel}>Completion Rate</div>
                      <div className={styles.statValue}>{analytics.averageCompletion}%</div>
                    </div>
                  </div>
                </Card>

                <Card className={styles.statCard}>
                  <div className={styles.statContent}>
                    <div className={styles.statIcon}>
                      <FiUsers />
                    </div>
                    <div>
                      <div className={styles.statLabel}>Instructors</div>
                      <div className={styles.statValue}>{analytics.totalInstructors}</div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Pending Courses */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Pending Courses (Awaiting Approval)</h2>
              </div>

              <div className={styles.coursesList}>
                {courses.filter(c => !c.isPublished).length === 0 ? (
                  <Card>
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      <p>No pending courses</p>
                    </div>
                  </Card>
                ) : (
                  courses.filter(c => !c.isPublished).map((course) => (
                    <Card key={course.id} className={styles.courseItem}>
                      <div className={styles.courseHeader}>
                        <div>
                          <h3>{course.title}</h3>
                          <p>{course.subject?.name || 'No subject'}</p>
                        </div>
                        <div className={styles.courseStats}>
                          <div className={styles.stat}>
                            <span className={styles.label}>Instructor:</span>
                            <span className={styles.value}>{course.instructor?.name || 'Unknown'}</span>
                          </div>
                          <div className={styles.stat}>
                            <span className={styles.label}>Status:</span>
                            <span className={styles.value} style={{ color: 'var(--warning)' }}>Pending Approval</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.courseActions}>
                        <Button variant="outline" size="small">
                          View Details
                        </Button>
                        <Button 
                          variant="primary" 
                          size="small"
                          onClick={() => handlePublishCourse(course.id)}
                        >
                          Approve & Publish
                        </Button>
                        <Button 
                          variant="danger" 
                          size="small"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users View */}
        {viewMode === 'users' && (
          <div id="users" className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>User Management</h2>
              <Button variant="primary" onClick={openAddUserModal}>Add New User</Button>
            </div>

            <Card className={styles.tableCard}>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Level</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const normalizedRole = normalizeRole(u.role);
                      return (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`${styles.badge} ${styles[normalizedRole]}`}>
                              {normalizedRole}
                            </span>
                          </td>
                          <td>{u.level?.name || 'N/A'}</td>
                          <td>
                            <div className={styles.actions}>
                              <button className={styles.actionBtn} title="Edit" onClick={() => openEditUserModal(u)}>
                                <FiEdit2 />
                              </button>
                              <button className={styles.actionBtn} title="Delete" onClick={() => handleDeleteUser(u.id)}>
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Courses View */}
        {viewMode === 'courses' && (
          <div id="courses" className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>All Courses</h2>
            </div>

            <div className={styles.coursesList}>
              {courses.length === 0 ? (
                <Card>
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    <p>No courses yet</p>
                  </div>
                </Card>
              ) : (
                courses.map((course) => (
                  <Card key={course.id} className={styles.courseItem}>
                    <div className={styles.courseHeader}>
                      <div>
                        <h3>{course.title}</h3>
                        <p>{course.subject?.name || 'No subject'}</p>
                      </div>
                      <div className={styles.courseStats}>
                        <div className={styles.stat}>
                          <span className={styles.label}>Instructor:</span>
                          <span className={styles.value}>{course.instructor?.name || 'Unknown'}</span>
                        </div>
                        <div className={styles.stat}>
                          <span className={styles.label}>Status:</span>
                          <span className={styles.value}>{course.isPublished ? 'Published' : 'Draft'}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.courseActions}>
                      <Button variant="outline" size="small">
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="small"
                        onClick={() => course.isPublished ? handleUnpublishCourse(course.id) : handlePublishCourse(course.id)}
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button 
                        variant="danger" 
                        size="small"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {viewMode === 'analytics' && analytics && (
          <div id="analytics" className={styles.section}>
            <h2>Platform Analytics</h2>
            <div className={styles.analyticsGrid}>
              <Card className={styles.analyticsCard}>
                <h3>Total Enrollments</h3>
                <div className={styles.analyticsValue}>{analytics.totalEnrollments}</div>
                <p>Students enrolled in courses</p>
              </Card>

              <Card className={styles.analyticsCard}>
                <h3>Active Users</h3>
                <div className={styles.analyticsValue}>{analytics.activeUsers}</div>
                <p>Users active in last 30 days</p>
              </Card>

              <Card className={styles.analyticsCard}>
                <h3>Instructors</h3>
                <div className={styles.analyticsValue}>{analytics.totalInstructors}</div>
                <p>Active course creators</p>
              </Card>

              <Card className={styles.analyticsCard}>
                <h3>Total Users</h3>
                <div className={styles.analyticsValue}>{analytics.totalUsers}</div>
                <p>All registered users</p>
              </Card>

              <Card className={styles.analyticsCard}>
                <h3>Total Courses</h3>
                <div className={styles.analyticsValue}>{analytics.totalCourses}</div>
                <p>All courses on platform</p>
              </Card>

              <Card className={styles.analyticsCard}>
                <h3>Completion Rate</h3>
                <div className={styles.analyticsValue}>{analytics.averageCompletion}%</div>
                <p>Average course completion</p>
              </Card>
            </div>
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className={styles.modalOverlay} onClick={() => !userSubmitting && setShowUserModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                <button type="button" className={styles.modalClose} onClick={() => !userSubmitting && setShowUserModal(false)} aria-label="Close">
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleUserSubmit} className={styles.modalForm}>
                {userError && <p className={styles.modalError}>{userError}</p>}
                <label>
                  Name <span className={styles.required}>*</span>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Full name"
                    required
                    className={styles.input}
                  />
                </label>
                <label>
                  Email <span className={styles.required}>*</span>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className={styles.input}
                  />
                </label>
                <label>
                  Password {!editingUser && <span className={styles.required}>*</span>}
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder={editingUser ? "Leave blank to keep current" : "Password"}
                    required={!editingUser}
                    className={styles.input}
                  />
                </label>
                <label>
                  Role <span className={styles.required}>*</span>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    required
                    className={styles.input}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
                <label>
                  Level (for students)
                  <select
                    value={userLevelId}
                    onChange={(e) => setUserLevelId(e.target.value)}
                    className={styles.input}
                  >
                    <option value="">None</option>
                    {levelsWithSubjects.map((level) => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </label>
                <div className={styles.modalActions}>
                  <Button type="button" variant="outline" onClick={() => !userSubmitting && setShowUserModal(false)} disabled={userSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={userSubmitting}>
                    {userSubmitting ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update User' : 'Create User')}
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
