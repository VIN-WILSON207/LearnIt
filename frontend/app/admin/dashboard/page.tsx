'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import styles from './page.module.css';
import {
  FiUsers,
  FiBook,
  FiTrendingUp,
  FiCreditCard,
  FiAward,
  FiActivity,
  FiPieChart,
  FiArrowRight,
  FiCheckCircle,
  FiBell,
  FiMessageSquare,
  FiFlag,
  FiClock,
  FiMenu,
  FiX,
  FiLogOut,
} from 'react-icons/fi';
import SubscriptionManager from './subscriptions/SubscriptionManager';

const TABS = [
  'Overview',
  'Users',
  'Content',
  'Subscriptions',
  'Analytics',
  'Certificates',
  'Forum',
  'Support',
  'Settings',
] as const;

type Tab = (typeof TABS)[number];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [subTab, setSubTab] = useState<'users' | 'plans'>('users');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const getAuthToken = () => sessionStorage.getItem('token') || localStorage.getItem('token');

  const [overview, setOverview] = useState<any | null>(null);
  const [users, setUsers] = useState<any[] | null>(null);
  const [courses, setCourses] = useState<any[] | null>(null);
  const [courseReviewRequests, setCourseReviewRequests] = useState<any[] | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[] | null>(null);
  const [quizStats, setQuizStats] = useState<any | null>(null);
  const [certificates, setCertificates] = useState<any[] | null>(null);
  const [forumReports, setForumReports] = useState<any[] | null>(null);
  const [config, setConfig] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User tab specific state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Content tab specific state
  const [contentSearchQuery, setContentSearchQuery] = useState('');
  const [contentStatusFilter, setContentStatusFilter] = useState<'all' | 'pending' | 'published'>('pending');
  const [reviewRequestTypeFilter, setReviewRequestTypeFilter] = useState<'all' | 'UPDATE_REVIEW' | 'UNPUBLISH'>('all');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [reviewActionModal, setReviewActionModal] = useState<{ requestId: string; action: 'approve' | 'reject' } | null>(null);
  const [reviewActionNote, setReviewActionNote] = useState('');
  const [reviewActionSubmitting, setReviewActionSubmitting] = useState(false);
  const [levels, setLevels] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STUDENT', levelId: '', subjectId: '' });

  // Fetch overview on mount
  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        const res = await fetch('/api/analytics', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        if (res.ok) setOverview(await res.json());
      } catch (err) {
        console.error('Failed to load overview', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  // Reload content when status filter changes
  useEffect(() => {
    if (activeTab === 'Content') {
      loadTabData('Content');
    }
  }, [contentStatusFilter]);

  // Centralized loader for tabs so we can refresh and reuse logic
  const loadTabData = async (tab: Tab) => {
    const token = getAuthToken();
    setLoading(true);
    setError(null);
    try {
      if (tab === 'Overview') {
        const res = await fetch('/api/analytics', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        if (res.ok) setOverview(await res.json());
        return;
      }

      if (tab === 'Users') {
        const res = await fetch('/api/users', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        setUsers(res.ok ? await res.json() : []);
        return;
      }

      if (tab === 'Content') {
        const query = contentStatusFilter === 'all' ? '' : `?status=${contentStatusFilter}`;
        const [coursesRes, requestsRes] = await Promise.all([
          fetch(`/api/courses${query}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } }),
          fetch('/api/admin/courses/review-requests', { headers: { Authorization: token ? `Bearer ${token}` : '' } }),
        ]);
        setCourses(coursesRes.ok ? await coursesRes.json() : []);
        setCourseReviewRequests(requestsRes.ok ? await requestsRes.json() : []);
        return;
      }

      if (tab === 'Subscriptions') {
        const res = await fetch('/api/admin/subscriptions/all', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        setSubscriptions(res.ok ? await res.json() : []);
        return;
      }

      if (tab === 'Analytics') {
        const [engagementRes, leaderboardRes] = await Promise.all([
          fetch('/api/analytics/engagement', { headers: { Authorization: token ? `Bearer ${token}` : '' } }),
          fetch('/api/quiz-stats/leaderboard', { headers: { Authorization: token ? `Bearer ${token}` : '' } })
        ]);

        const engagement = engagementRes.ok ? await engagementRes.json() : null;
        const leaderboard = leaderboardRes.ok ? await leaderboardRes.json() : [];

        setQuizStats({ engagement, leaderboard });
        return;
      }

      if (tab === 'Certificates') {
        const res = await fetch('/api/certificates?all=true', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        setCertificates(res.ok ? await res.json() : []);
        return;
      }

      if (tab === 'Forum') {
        const res = await fetch('/api/forum/reports', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        setForumReports(res.ok ? await res.json() : []);
        return;
      }

      if (tab === 'Settings') {
        const res = await fetch('/api/config', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        setConfig(res.ok ? await res.json() : null);
        return;
      }
    } catch (err) {
      console.error('Failed to load tab data', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  // Download as CSV or JSON
  const toCSV = (arr: any[]) => {
    if (!arr || arr.length === 0) return '';
    const keys = Array.from(arr.reduce((s: Set<string>, o: any) => { Object.keys(o).forEach(k => s.add(k)); return s; }, new Set<string>()));
    const rows = [keys.join(',')];
    for (const obj of arr) {
      rows.push(keys.map(k => JSON.stringify(obj[k] ?? '')).join(','));
    }
    return rows.join('\n');
  };

  const downloadFile = (filename: string, content: string, mime = 'text/csv') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const getDescriptionLines = (raw?: string) => {
    if (!raw) return [];
    const text = raw.replace(/\r\n/g, '\n').trim();
    if (!text) return [];
    if (text.includes('\n')) {
      return text.split('\n').map((line) => line.trim()).filter(Boolean);
    }
    const firstMatch = text.match(/\d+\.\s+/);
    if (!firstMatch || firstMatch.index === undefined) {
      return [text];
    }
    const idx = firstMatch.index;
    const intro = text.slice(0, idx).trim();
    const numbered = text
      .slice(idx)
      .split(/(?=\d+\.\s+)/g)
      .map((line) => line.trim())
      .filter(Boolean);
    return intro ? [intro, ...numbered] : numbered;
  };

  const handleRefresh = () => loadTabData(activeTab);

  const handleExportCSV = () => {
    if (activeTab === 'Users' && users) {
      const csv = toCSV(users);
      downloadFile('users.csv', csv || JSON.stringify(users, null, 2), csv ? 'text/csv' : 'application/json');
      return;
    }
    if (activeTab === 'Content' && courses) {
      const csv = toCSV(courses);
      downloadFile('courses.csv', csv || JSON.stringify(courses, null, 2), csv ? 'text/csv' : 'application/json');
      return;
    }
    // default: export overview as JSON
    downloadFile('overview.json', JSON.stringify(overview ?? {}, null, 2), 'application/json');
  };

  const handleVerifyCertificate = (id: string) => {
    window.open(`/certificates/${id}`, '_blank');
  };

  const handleReviewReport = (id: string) => {
    window.open(`/forum/reports/${id}`, '_blank');
  };

  // Forum moderation handlers
  const handleDeleteForumPost = async (id: string) => {
    if (!confirm('Delete this forum post? This action cannot be undone.')) return;
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/forum/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ action: 'delete' }),
      });
      if (res.ok) {
        setForumReports((prev) => prev?.filter((r) => r.id !== id) || null);
      } else {
        const text = await res.text();
        setError(text || 'Failed to delete post');
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) setError(err.message);
      else setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleFlagForumPost = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/forum/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ action: 'flag' }),
      });
      if (res.ok) {
        setForumReports((prev) => prev?.map((r) => (r.id === id ? { ...r, status: 'flagged' } : r)) || null);
      } else {
        const text = await res.text();
        setError(text || 'Failed to flag post');
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) setError(err.message);
      else setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveForumPost = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/forum/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        setForumReports((prev) => prev?.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)) || null);
      } else {
        const text = await res.text();
        setError(text || 'Failed to approve post');
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) setError(err.message);
      else setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Admin action handlers
  const handleViewUser = async (id?: string) => {
    if (!id) {
      setError('Missing user id for this account.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/users/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (res.ok) {
        setViewingUser(await res.json());
      } else {
        const text = await res.text();
        setError(text || 'Failed to load user details');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserClick = async () => {
    setIsCreateModalOpen(true);
    try {
      const res = await fetch('/api/auth/config');
      if (res.ok) setLevels(await res.json());
    } catch (err) {
      console.error('Failed to load levels', err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'STUDENT', levelId: '', subjectId: '' });
        loadTabData('Users'); // Refresh list
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Effect to handle Subject Logic based on Level
  useEffect(() => {
    if (newUser.role === 'STUDENT' && newUser.levelId) {
      const selectedLevel = levels.find(l => l.id === newUser.levelId);
      if (selectedLevel) {
        setAvailableSubjects(selectedLevel.subjects || []);

        const isOrdinary = selectedLevel.name.toLowerCase().includes('ordinary');
        const isAdvanced = selectedLevel.name.toLowerCase().includes('advanced');

        if (isOrdinary) {
          const csSubject = selectedLevel.subjects.find((s: any) => s.name.toLowerCase().includes('computer science'));
          if (csSubject) {
            setNewUser(prev => ({ ...prev, subjectId: csSubject.id }));
          }
        }
      }
    } else {
      setAvailableSubjects([]);
      setNewUser(prev => ({ ...prev, subjectId: '' }));
    }
  }, [newUser.levelId, newUser.role, levels]);

  const handleSuspendUser = async (id?: string) => {
    if (!id) {
      setError('Missing user id for this account.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/users/${id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        setUsers((prev) => prev?.map((u) => (u.id === id ? { ...u, status: 'SUSPENDED' } : u)) || null);
      } else {
        const text = await res.text();
        setError(text || 'Failed to suspend user');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreUser = async (id?: string) => {
    if (!id) {
      setError('Missing user id for this account.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/users/${id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        setUsers((prev) => prev?.map((u) => (u.id === id ? { ...u, status: 'ACTIVE' } : u)) || null);
      } else {
        const text = await res.text();
        setError(text || 'Failed to restore user');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id?: string) => {
    if (!id) {
      setError('Missing user id for this account.');
      return;
    }
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/users/${id}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        setUsers((prev) => prev?.filter((u) => u.id !== id) || null);
      } else {
        const text = await res.text();
        setError(text || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (id: string) => {
    window.open(`/courses/${id}`, '_blank');
  };

  const handleApproveCourse = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/courses/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        setCourses((prev) => prev?.filter((c) => c.id !== id) || null);
      } else {
        const text = await res.text();
        setError(text || 'Failed to approve course');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublishCourse = async (id: string) => {
    if (!confirm('Unpublish this course?')) return;
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/courses/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ action: 'unpublish' }),
      });
      if (res.ok) {
        setCourses((prev) => prev?.filter((c) => c.id !== id) || null);
      } else {
        const text = await res.text();
        setError(text || 'Failed to unpublish course');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/courses/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ action: 'delete' }),
      });
      if (res.ok) {
        setCourses((prev) => prev?.filter((c) => c.id !== id) || null);
      } else {
        const text = await res.text();
        setError(text || 'Failed to delete course');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const openReviewActionModal = (requestId: string, action: 'approve' | 'reject') => {
    setReviewActionModal({ requestId, action });
    setReviewActionNote(action === 'approve' ? 'Approved by admin.' : '');
  };

  const closeReviewActionModal = () => {
    setReviewActionModal(null);
    setReviewActionNote('');
    setReviewActionSubmitting(false);
  };

  const handleCourseReviewRequestAction = async (requestId: string, action: 'approve' | 'reject', note?: string) => {
    setReviewActionSubmitting(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/courses/review-requests/${requestId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ action, note: note?.trim() || undefined }),
      });

      if (res.ok) {
        setCourseReviewRequests((prev) => prev?.filter((r) => r.id !== requestId) || []);
        await loadTabData('Content');
        return true;
      } else {
        const text = await res.text();
        setError(text || 'Failed to process review request');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setReviewActionSubmitting(false);
    }
    return false;
  };

  const filteredUsers = users?.filter((u: any) => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const filteredCourses = courses?.filter((c: any) => {
    return c.title.toLowerCase().includes(contentSearchQuery.toLowerCase());
  }) || [];
  const filteredCourseReviewRequests = (courseReviewRequests || []).filter((request: any) => {
    if (reviewRequestTypeFilter === 'all') return true;
    return request.type === reviewRequestTypeFilter;
  });


  const renderOverview = () => (
    <div>
      <div className={styles.headerRow}>
        <h1>Platform Overview</h1>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={handleExportCSV}>Export CSV</Button>
          <Button variant="primary" onClick={handleRefresh}>Refresh Data</Button>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>A high-level summary of LearnIT's performance</p>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon}><FiUsers /></div>
            <div>
              <div className={styles.statLabel}>Total Users</div>
              <div className={styles.statValue}>{overview?.totalUsers ?? 0}</div>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.1)' }}><FiCreditCard /></div>
            <div>
              <div className={styles.statLabel}>Active Subscriptions</div>
              <div className={styles.statValue}>{overview?.activeSubscriptions ?? 0}</div>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent)' }}><FiBook /></div>
            <div>
              <div className={styles.statLabel}>Published Courses</div>
              <div className={styles.statValue}>{overview?.totalCourses ?? 0}</div>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}><FiTrendingUp /></div>
            <div>
              <div className={styles.statLabel}>Estimated Revenue</div>
              <div className={styles.statValue}>XAF {overview?.revenue30d?.toLocaleString() ?? 0}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.overviewLayout}>
        <Card className={styles.activityCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Recent Activity</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', cursor: 'pointer' }}>View all</span>
          </div>
          <div className={styles.activityFeed}>
            {overview?.recentActivity?.length > 0 ? (
              overview.recentActivity.map((activity: any) => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    {activity.type === 'USER_REGISTRATION' ? <FiUsers /> : <FiBell />}
                  </div>
                  <div className={styles.activityContent}>
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                    <div className={styles.activityTime}>{new Date(activity.date).toLocaleString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No recent activity recorded.
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions Sidebar */}
        <div className={styles.quickActionsGrid}>
          <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>

          <Card className={styles.actionCard} onClick={() => setActiveTab('Content')}>
            <div className={styles.actionCount}>{overview?.pendingCoursesCount ?? 0}</div>
            <div className={styles.actionLabel}>Pending Course Reviews</div>
            <div className={styles.actionLink}>Review now <FiArrowRight /></div>
          </Card>

          <Card className={styles.actionCard} onClick={() => setActiveTab('Forum')}>
            <div className={styles.actionCount}>{forumReports?.length ?? 0}</div>
            <div className={styles.actionLabel}>Flagged Post Reports</div>
            <div className={styles.actionLink}>Moderate <FiArrowRight /></div>
          </Card>

          <Card className={styles.actionCard} style={{ borderStyle: 'dashed', cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
              <FiCheckCircle /> System Healthy
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              All services operational as of {new Date().toLocaleTimeString()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className={styles.usersSection}>
      <div className={styles.headerRow}>
        <h1>User Management</h1>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={handleCreateUserClick}>+ Add New User</Button>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage system accounts, roles, and access statuses</p>

      {/* Filter Bar */}
      <Card className={styles.filterCard} style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className={styles.filterRow}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name or email..."
              className={styles.searchInput}
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
            />
          </div>
          <select
            className={styles.roleSelect}
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="PROFESSOR">Instructors</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </Card>

      <Card className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Access Role</th>
                <th>Account Status</th>
                <th>Joined On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u: any) => {
                  const userId = u?.id ?? u?.userId ?? u?._id ?? '';
                  return (
                    <tr key={userId || u.email}>
                      <td>
                        <div className={styles.userName}>{u.name}</div>
                        <div className={styles.userEmail}>{u.email}</div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[u.role?.toLowerCase()]}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[u.status?.toLowerCase() || 'active']}`}>
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Button variant="outline" size="small" onClick={() => handleViewUser(userId)} disabled={!userId}>View</Button>
                          {u.status === 'SUSPENDED' ? (
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleRestoreUser(userId)}
                              disabled={!userId}
                              style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                            >
                              Restore
                            </Button>
                          ) : (
                            <Button variant="outline" size="small" onClick={() => handleSuspendUser(userId)} disabled={!userId}>Suspend</Button>
                          )}
                          <Button variant="danger" size="small" onClick={() => handleDeleteUser(userId)} disabled={!userId}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {users ? 'No users found matching your filters.' : 'Loading users...'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => (
    <div className={styles.contentSection}>
      <div className={styles.headerRow}>
        <h1>Content Moderation</h1>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => loadTabData('Content')}>Refresh Feed</Button>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Review and manage course publications across the platform</p>

      <Card className={styles.tableCard} style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '1rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Course Review Requests</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {([
                { key: 'all', label: 'All' },
                { key: 'UPDATE_REVIEW', label: 'Update Review' },
                { key: 'UNPUBLISH', label: 'Unpublish' },
              ] as const).map((option) => (
                <div
                  key={option.key}
                  className={`${styles.statusTab} ${reviewRequestTypeFilter === option.key ? styles.active : ''}`}
                  onClick={() => setReviewRequestTypeFilter(option.key)}
                >
                  {option.label}
                </div>
              ))}
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {filteredCourseReviewRequests.length}/{courseReviewRequests?.length || 0} shown
            </span>
          </div>
        </div>

        {filteredCourseReviewRequests.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {filteredCourseReviewRequests.map((request: any) => (
              <div
                key={request.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  display: 'grid',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{request.type === 'UNPUBLISH' ? 'Unpublish Request' : 'Update Review Request'}</strong>
                  <span className={`${styles.statusTag} ${styles.pending}`}>{request.status}</span>
                </div>
                <div><strong>Course:</strong> {request.course?.title || 'Unknown course'} ({request.courseId || 'N/A'})</div>
                <div><strong>Instructor:</strong> {request.requester?.name || 'Unknown'} ({request.requester?.email || 'No email'})</div>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{request.message}</div>
                <div className={styles.actions} style={{ marginTop: '0.25rem' }}>
                  <Button variant="primary" size="small" onClick={() => openReviewActionModal(request.id, 'approve')}>
                    Approve Request
                  </Button>
                  <Button variant="outline" size="small" onClick={() => openReviewActionModal(request.id, 'reject')}>
                    Reject Request
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)' }}>
            {courseReviewRequests && courseReviewRequests.length > 0
              ? 'No requests match this filter.'
              : 'No open course review requests.'}
          </div>
        )}
      </Card>

      {/* Advanced Filter Bar */}
      <div className={styles.contentFilterBar}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['pending', 'published', 'all'] as const).map(s => (
            <div
              key={s}
              className={`${styles.statusTab} ${contentStatusFilter === s ? styles.active : ''}`}
              onClick={() => setContentStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          ))}
        </div>
        <div className={styles.searchContainer} style={{ maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search courses by title..."
            className={styles.searchInput}
            value={contentSearchQuery}
            onChange={(e) => setContentSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.coursesGrid}>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((c: any) => (
            <Card key={c.id} className={styles.courseCard}>
              <div className={styles.courseCardContent}>
                <div className={styles.courseMeta}>
                  <span>{c.subject?.name || 'General'}</span>
                  <span className={`${styles.statusTag} ${c.isPublished ? styles.published : styles.pending}`}>
                    {c.isPublished ? 'Live' : 'Draft'}
                  </span>
                </div>
                  <h3 style={{ margin: '0.5rem 0' }}>{c.title}</h3>
                  <div className={styles.instructorInfo}>
                    <FiUsers size={14} />
                    <span>{c.instructor?.name || 'Unknown Instructor'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {c.description ? (
                      <div className={styles.courseDescriptionList}>
                        {getDescriptionLines(c.description).map((line: string, index: number) => (
                          <div key={index} className={styles.courseDescriptionItem}>{line}</div>
                        ))}
                      </div>
                    ) : (
                      'No description provided.'
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Lessons: {c?._count?.lessons ?? c?.lessons?.length ?? 0}
                  </div>
                <div className={styles.actions} style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <Button variant="outline" size="small" onClick={() => handleViewCourse(c.id)}>Preview</Button>
                  {!c.isPublished ? (
                    <Button variant="primary" size="small" onClick={() => handleApproveCourse(c.id)}>Approve</Button>
                  ) : (
                    <Button variant="danger" size="small" onClick={() => handleUnpublishCourse(c.id)}>Unpublish</Button>
                  )}
                    <Button variant="danger" size="small" onClick={() => handleDeleteCourse(c.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
              {courses ? 'No courses found matching your criteria.' : 'Loading platform content...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );


  const renderSubscriptions = () => (
    <div className={styles.subscriptionsSection}>
      <div className={styles.headerRow}>
        <h1>Subscriptions & Payments</h1>
        <div className={styles.headerActions}>
          <Button
            variant={subTab === 'users' ? 'primary' : 'outline'}
            onClick={() => setSubTab('users')}
          >
            User Subscriptions
          </Button>
          <Button
            variant={subTab === 'plans' ? 'primary' : 'outline'}
            onClick={() => setSubTab('plans')}
          >
            Manage Plans
          </Button>
        </div>
      </div>

      {subTab === 'users' ? (
        <>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Monitor and manage all student subscription statuses</p>
          <Card className={styles.tableCard}>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions && subscriptions.length > 0 ? (
                    subscriptions.map((s: any) => (
                      <tr key={s.id}>
                        <td>
                          <div className={styles.userName}>{s.student?.name || 'Unknown'}</div>
                          <div className={styles.userEmail}>{s.student?.email || 'N/A'}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{s.plan?.name || 'Unknown Plan'}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            XAF {s.plan?.price || 0} / {s.plan?.duration || 0} mo
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${s.isActive ? styles.active : styles.inactive}`}>
                            {s.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(s.startDate).toLocaleDateString()}</td>
                        <td>{new Date(s.endDate).toLocaleDateString()}</td>
                        <td>
                          <div className={styles.actions}>
                            <Button size="small" variant="outline">View Details</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {subscriptions ? 'No subscriptions found.' : 'Loading subscriptions...'}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <SubscriptionManager />
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className={styles.analyticsSection}>
      <div className={styles.headerRow}>
        <h1>Educational Analytics</h1>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={handleRefresh}>Refresh Data</Button>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Tracking student engagement and platform effectiveness</p>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon}><FiActivity /></div>
            <div>
              <div className={styles.statLabel}>Active Students</div>
              <div className={styles.statValue}>{quizStats?.engagement?.activeUsersCount ?? 0}</div>
              <div className={styles.statSub}>Engaged in last 30 days</div>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent)' }}><FiPieChart /></div>
            <div>
              <div className={styles.statLabel}>Completion Rate</div>
              <div className={styles.statValue}>{quizStats?.engagement?.completionRate ?? 0}%</div>
              <div className={styles.statSub}>Average course progress</div>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}><FiTrendingUp /></div>
            <div>
              <div className={styles.statLabel}>Content Interaction</div>
              <div className={styles.statValue}>{quizStats?.engagement?.platformMetrics?.totalDataPoints ?? 0}</div>
              <div className={styles.statSub}>Total progress updates</div>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.analyticsLayout}>
        <Card className={styles.chartCard}>
          <h3>🏆 Student Leaderboard</h3>
          <p>Top performing students based on average quiz scores</p>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Average Score</th>
                </tr>
              </thead>
              <tbody>
                {quizStats?.leaderboard?.length > 0 ? (
                  quizStats.leaderboard.map((entry: any, index: number) => (
                    <tr key={entry.user.id}>
                      <td>#{index + 1}</td>
                      <td>
                        <div className={styles.userName}>{entry.user.name}</div>
                        <div className={styles.userEmail}>{entry.user.email}</div>
                      </td>
                      <td>
                        <div className={styles.progressContainer}>
                          <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${entry.avgScore}%` }}></div>
                          </div>
                          <span style={{ fontWeight: 600, minWidth: '50px' }}>{entry.avgScore.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>No leaderboard data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderCertificates = () => (
    <div className={styles.certificatesSection}>
      <div className={styles.headerRow}>
        <h1>Academic Achievements</h1>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={handleRefresh}>Refresh Certificates</Button>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Managing issued certificates and student completion records</p>

      <Card className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Certificate</th>
                <th>Student</th>
                <th>Course</th>
                <th>Issued Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates && certificates.length > 0 ? (
                certificates.map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <div className={styles.achievementBadge}>
                        <FiAward /> Achievement
                      </div>
                      <div className={styles.certId}>{c.id.substring(0, 8)}...</div>
                    </td>
                    <td>
                      <div className={styles.userName}>{c.student?.name || 'Unknown Student'}</div>
                      <div className={styles.userEmail}>{c.student?.email || 'No Email'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.course?.title || 'Unknown Course'}</div>
                    </td>
                    <td>
                      <div className={styles.issuedDate}>
                        {new Date(c.issueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button size="small" variant="primary" onClick={() => handleVerifyCertificate(c.id)}>
                          Verify
                        </Button>
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => window.open(c.fileUrl, '_blank')}
                        >
                          View PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>No certificates issued yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderForum = () => (
    <div className={styles.forumSection}>
      <div className={styles.headerRow}>
        <h1>Community Moderation</h1>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => loadTabData('Forum')}>Refresh Reports</Button>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Audit and manage community discussions and flagged content</p>

      <Card className={styles.tableCard} style={{ padding: '0' }}>
        {forumReports && forumReports.length > 0 ? (
          forumReports.map((r: any) => (
            <div key={r.id} className={styles.reportItem}>
              <div className={styles.reportContent}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FiMessageSquare size={18} color="var(--primary)" />
                  <h3 style={{ margin: 0 }}>{r.title || 'Untitled Post'}</h3>
                </div>

                <div className={styles.reportMeta}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiUsers size={12} />
                    <span>{r.author}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiClock size={12} />
                    <span>{r.createdDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiBook size={12} />
                    <span>{r.course}</span>
                  </div>
                </div>

                <div className={styles.reportPreview}>
                  {r.content}
                </div>

                <div className={styles.reportStatus}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`${styles.badge} ${styles[r.status?.toLowerCase() || 'pending']}`}>
                      {r.status || 'Pending Review'}
                    </span>
                    {r.reportedBy && (
                      <span className={styles.reportedBy}>
                        <FiFlag size={12} />
                        Flagged by {r.reportedBy}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.actions} style={{ flexDirection: 'column', gap: '8px' }}>
                <Button size="small" variant="primary" style={{ width: '100px' }} onClick={() => handleApproveForumPost(r.id)}>
                  Dismiss
                </Button>
                <Button size="small" variant="outline" style={{ width: '100px' }} onClick={() => handleFlagForumPost(r.id)}>
                  Flag
                </Button>
                <Button size="small" variant="danger" style={{ width: '100px' }} onClick={() => handleDeleteForumPost(r.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>No active forum reports to display.</div>
          </div>
        )}
      </Card>
    </div>
  );

  const renderSupport = () => (
    <div>
      <div className={styles.headerRow}>
        <h1>Support Center</h1>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={() => window.location.href = '/admin/dashboard/support'}>
            Open Support Inbox
          </Button>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Review and respond to user support messages in the dedicated support panel.
      </p>
    </div>
  );

  const handleSettingChange = (key: string, value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      rawSettings: prev.rawSettings.map((s: any) => (s.key === key ? { ...s, value } : s))
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/config/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ settings: config.rawSettings }),
      });

      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const renderSettings = () => (
    <div className={styles.settingsSection}>
      <div className={styles.headerRow}>
        <h1>System Configuration</h1>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={handleSaveSettings} disabled={loading}>
            {loading ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Global platform behavior and educational defaults</p>

      <div className={styles.settingsGrid}>
        {/* General Settings */}
        <Card className={styles.settingsCard}>
          <h3>Platform Basics</h3>
          <div className={styles.formContainer}>
            {config?.rawSettings?.filter((s: any) => ['appName', 'contactEmail', 'maintenanceMode'].includes(s.key)).map((s: any) => (
              <div key={s.key} className={styles.formGroup}>
                <label className={styles.formLabel}>{s.key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}</label>
                {s.type === 'boolean' ? (
                  <select
                    className={styles.formSelect}
                    value={s.value}
                    onChange={(e) => handleSettingChange(s.key, e.target.value)}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                ) : (
                  <input
                    className={styles.formInput}
                    type={s.type === 'number' ? 'number' : 'text'}
                    value={s.value}
                    onChange={(e) => handleSettingChange(s.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Academic Settings */}
        <Card className={styles.settingsCard}>
          <h3>Educational Defaults</h3>
          <div className={styles.formContainer}>
            {config?.rawSettings?.filter((s: any) => ['globalQuizPassMark', 'maxQuizAttempts', 'allowInstructorRegistration'].includes(s.key)).map((s: any) => (
              <div key={s.key} className={styles.formGroup}>
                <label className={styles.formLabel}>{s.key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}</label>
                {s.type === 'boolean' ? (
                  <select
                    className={styles.formSelect}
                    value={s.value}
                    onChange={(e) => handleSettingChange(s.key, e.target.value)}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      className={styles.formInput}
                      type="number"
                      value={s.value}
                      onChange={(e) => handleSettingChange(s.key, e.target.value)}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {s.key.includes('PassMark') ? '%' : 'attempts'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );

  return (
    <ProtectedRoute requiredRole="admin">
      <Navbar hideMenu={true} />
      <div className={styles.adminLayout}>
        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className={styles.mobileOverlay}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.brand}>Admin</div>
          <nav>
            {TABS.map((t) => (
              <button
                key={t}
                className={`${styles.navItem} ${activeTab === t ? styles.active : ''}`}
                onClick={() => {
                  setActiveTab(t);
                  setIsMobileMenuOpen(false);
                }}
              >
                {t}
              </button>
            ))}
          </nav>
          <div className={styles.sidebarFooter}>
            <div className={styles.userSummary}>{user?.name}</div>
            <div className={styles.roleBadge}>Administrator</div>
            <button
              className={styles.logoutButton}
              onClick={() => {
                if (confirm('Are you sure you want to logout?')) {
                  logout();
                  window.location.href = '/';
                }
              }}
            >
              <FiLogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className={styles.main}>
          {loading && <div className={styles.loading}>Loading…</div>}
          {error && <div className={styles.error}>Error: {error}</div>}

          <div className={styles.content}>
            {activeTab === 'Overview' && renderOverview()}
            {activeTab === 'Users' && renderUsers()}
            {activeTab === 'Content' && renderContent()}
            {activeTab === 'Subscriptions' && renderSubscriptions()}
            {activeTab === 'Analytics' && renderAnalytics()}
            {activeTab === 'Certificates' && renderCertificates()}
            {activeTab === 'Forum' && renderForum()}
            {activeTab === 'Support' && renderSupport()}
            {activeTab === 'Settings' && renderSettings()}
          </div>

          {/* Create User Modal */}
          {reviewActionModal && (
            <div className={styles.modalOverlay} onClick={closeReviewActionModal}>
              <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>
                  {reviewActionModal.action === 'approve' ? 'Approve Request' : 'Reject Request'}
                </h2>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Admin Note</label>
                  <textarea
                    className={styles.formInput}
                    style={{ minHeight: '110px' }}
                    value={reviewActionNote}
                    onChange={(e) => setReviewActionNote(e.target.value)}
                    placeholder={
                      reviewActionModal.action === 'approve'
                        ? 'Optional note to instructor'
                        : 'Reason for rejection (minimum 10 characters)'
                    }
                  />
                </div>
                <div className={styles.modalActions}>
                  <Button type="button" variant="outline" onClick={closeReviewActionModal} disabled={reviewActionSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant={reviewActionModal.action === 'approve' ? 'primary' : 'danger'}
                    disabled={
                      reviewActionSubmitting ||
                      (reviewActionModal.action === 'reject' && reviewActionNote.trim().length < 10)
                    }
                    onClick={async () => {
                      const ok = await handleCourseReviewRequestAction(
                        reviewActionModal.requestId,
                        reviewActionModal.action,
                        reviewActionNote
                      );
                      if (ok) closeReviewActionModal();
                    }}
                  >
                    {reviewActionSubmitting
                      ? 'Submitting...'
                      : reviewActionModal.action === 'approve'
                        ? 'Approve'
                        : 'Reject'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Create User Modal */}
          {isCreateModalOpen && (
            <div className={styles.modalOverlay} onClick={() => setIsCreateModalOpen(false)}>
              <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Create New User</h2>
                <form onSubmit={handleCreateSubmit}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Name</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      required
                      value={newUser.name}
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email</label>
                    <input
                      className={styles.formInput}
                      type="email"
                      required
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Password</label>
                    <input
                      className={styles.formInput}
                      type="password"
                      required
                      value={newUser.password}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Role</label>
                    <select
                      className={styles.formSelect}
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="INSTRUCTOR">Instructor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  {newUser.role === 'STUDENT' && (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Level</label>
                        <select
                          className={styles.formSelect}
                          value={newUser.levelId}
                          onChange={e => setNewUser({ ...newUser, levelId: e.target.value })}
                          required={newUser.role === 'STUDENT'}
                        >
                          <option value="">Select Level</option>
                          {levels.map((l: any) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Subject Selection */}
                      {newUser.levelId && availableSubjects.length > 0 && (
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Subject</label>
                          <select
                            className={styles.formSelect}
                            value={newUser.subjectId}
                            onChange={e => setNewUser({ ...newUser, subjectId: e.target.value })}
                            required
                            disabled={levels.find(l => l.id === newUser.levelId)?.name.toLowerCase().includes('ordinary')}
                          >
                            <option value="">Select Subject</option>
                            {availableSubjects.map((s: any) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}
                  <div className={styles.modalActions}>
                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="primary">Create User</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* View User Modal */}
          {viewingUser && (
            <div className={styles.modalOverlay} onClick={() => setViewingUser(null)}>
              <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>User Details</h2>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>ID</span>
                  <span className={styles.detailValue}>{viewingUser.id}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Name</span>
                  <span className={styles.detailValue}>{viewingUser.name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{viewingUser.email}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Role</span>
                  <span className={styles.badge && styles.badge + ' ' + (styles[viewingUser.role?.toLowerCase()] || '')}>
                    {viewingUser.role}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={styles.detailValue}>{viewingUser.status}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Joined</span>
                  <span className={styles.detailValue}>{new Date(viewingUser.createdAt || viewingUser.joinedAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className={styles.modalActions}>
                  <Button variant="outline" onClick={() => setViewingUser(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
