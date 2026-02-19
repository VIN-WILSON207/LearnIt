'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import styles from './page.module.css';
import { StudentLayout } from '@/components/StudentLayout';

interface Thread {
    id: string;
    courseId: string;
    courseName: string;
    title: string;
    author: string;
    authorRole: 'student' | 'instructor' | 'admin';
    content: string;
    createdDate: string;
    replies: number;
    lastActivity: string;
}

interface Course {
    id: string;
    title: string;
}

export default function StudentForum() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUserCoursesAndThreads();
        }
    }, [user]);

    const fetchUserCoursesAndThreads = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Fetch user's enrolled courses
            const enrollRes = await fetch(`/api/enrollments?studentId=${user.id}`, {
                headers: { Authorization: token ? `Bearer ${token}` : '' },
            });
            const enrolledCourseIds = enrollRes.ok ? await enrollRes.json() : [];
            setEnrolledCourses(Array.isArray(enrolledCourseIds) ? enrolledCourseIds : []);

            // If no enrolled courses, show message
            if (!enrolledCourseIds || enrolledCourseIds.length === 0) {
                showToast('Enroll in a course to participate in course discussions', 'info');
                setThreads([]);
                setLoading(false);
                return;
            }

            // Fetch discussions for all enrolled courses
            const allThreads: Thread[] = [];
            for (const courseId of enrolledCourseIds) {
                try {
                    const threadsRes = await fetch(`/api/forum/posts/${courseId}`, {
                        headers: { Authorization: token ? `Bearer ${token}` : '' },
                    });
                    if (threadsRes.ok) {
                        const courseThreads = await threadsRes.json();
                        allThreads.push(...(Array.isArray(courseThreads) ? courseThreads : []));
                    }
                } catch (err) {
                    console.error(`Failed to load threads for course ${courseId}:`, err);
                }
            }

            // Sort by most recent first
            allThreads.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
            setThreads(allThreads);
        } catch (err) {
            console.error('Failed to load forum data:', err);
            showToast('Failed to load forum discussions', 'error');
            setThreads([]);
        } finally {
            setLoading(false);
        }
    };

    const validateThread = (): string | null => {
        if (!newTitle.trim()) return 'Please enter a discussion title';
        if (newTitle.trim().length < 5) return 'Title must be at least 5 characters';
        if (!newContent.trim()) return 'Please enter discussion content';
        if (newContent.trim().length < 10) return 'Content must be at least 10 characters';
        if (!selectedCourse) return 'Please select a course';
        return null;
    };

    const handleCreateThread = async () => {
        const error = validateThread();
        if (error) {
            showToast(error, 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/forum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
                body: JSON.stringify({
                    courseId: selectedCourse,
                    userId: user?.id,
                    title: newTitle,
                    content: newContent,
                    userRole: user?.role,
                }),
            });

            if (res.ok) {
                const newThread = await res.json();
                setNewTitle('');
                setNewContent('');
                setSelectedCourse('');
                showToast('Discussion posted successfully!', 'success');

                // Add new thread to list
                setThreads((prev) => [newThread, ...prev]);
            } else {
                const errorMsg = await res.text();
                showToast(errorMsg || 'Failed to create discussion', 'error');
            }
        } catch (err) {
            console.error('Error creating thread:', err);
            showToast('Error creating discussion', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredRole="student">
                <Navbar />
                <StudentLayout active="community">
                    <div className={styles.container}>
                        <Card><p>Loading forum discussions...</p></Card>
                    </div>
                </StudentLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole="student">
            <Navbar />
            <StudentLayout active="community">
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1>Community Forum</h1>
                        <p>Connect with peers in your courses, ask questions, and share knowledge</p>
                    </div>

                {/* Create New Thread */}
                {enrolledCourses.length > 0 ? (
                    <Card className={styles.createSection}>
                        <h2>Start a New Discussion</h2>
                        <div className={styles.formGroup}>
                            <label>Select Course</label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className={styles.select}
                            >
                                <option value="">Choose a course...</option>
                                {enrolledCourses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Discussion Title</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="What's your question or topic?"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                maxLength={120}
                            />
                            <small>{newTitle.length}/120</small>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="Share details, context, or your question..."
                                rows={5}
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                maxLength={2000}
                            />
                            <small>{newContent.length}/2000</small>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleCreateThread}
                            disabled={submitting}
                        >
                            {submitting ? 'Posting...' : 'Post Discussion'}
                        </Button>
                    </Card>
                ) : (
                    <Card className={styles.emptyState}>
                        <p>Enroll in a course to participate in discussions</p>
                    </Card>
                )}

                {/* Forum Threads */}
                <div className={styles.threadsSection}>
                    <h2>Recent Discussions ({threads.length})</h2>
                    {threads.length === 0 ? (
                        <Card>
                            <p>No discussions yet in your courses. Be the first to start a conversation!</p>
                        </Card>
                    ) : (
                        <div className={styles.threadsList}>
                            {threads.map((thread) => (
                                <Card key={thread.id} className={styles.threadCard}>
                                    <div className={styles.threadHeader}>
                                        <div className={styles.threadTitle}>
                                            <h3>{thread.title}</h3>
                                            <p className={styles.courseName}>{thread.courseName}</p>
                                        </div>
                                        <div className={styles.threadMeta}>
                                            <span className={styles.replies}>
                                                {Array.isArray(thread.replies) ? thread.replies.length : (thread.replies || 0)} replies
                                            </span>
                                            <span className={styles.date}>{thread.lastActivity}</span>
                                        </div>
                                    </div>

                                    <p className={styles.threadContent}>{thread.content.substring(0, 200)}...</p>

                                    <div className={styles.threadFooter}>
                                        <span className={styles.author}>
                                            By <strong>{thread.author}</strong>
                                            {thread.authorRole !== 'student' && (
                                                <span className={styles.badge}>{thread.authorRole}</span>
                                            )}
                                        </span>
                                        <Button size="small" onClick={() => window.open(`/forum/${thread.id}`, '_blank')}>
                                            View Discussion
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
                </div>
            </StudentLayout>
        </ProtectedRoute>
    );
}
