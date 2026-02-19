'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import styles from './page.module.css';

interface Reply {
    id: string;
    author: string;
    authorRole: 'student' | 'instructor' | 'admin';
    content: string;
    createdDate: string;
    isApproved: boolean;
}

interface Discussion {
    id: string;
    courseId: string;
    courseName: string;
    title: string;
    author: string;
    authorRole: 'student' | 'instructor' | 'admin';
    content: string;
    createdDate: string;
    replies: Reply[];
    isModerated: boolean;
}

export default function ForumThread() {
    const params = useParams();
    const { user } = useAuth();
    const { showToast } = useToast();
    const threadId = params.id as string;

    const [discussion, setDiscussion] = useState<Discussion | null>(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDiscussion();
    }, [threadId]);

    const fetchDiscussion = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/forum?id=${threadId}`, {
                headers: { Authorization: token ? `Bearer ${token}` : '' },
            });
            if (res.ok) {
                const data = await res.json();
                setDiscussion(data);
            } else {
                showToast('Failed to load discussion', 'error');
            }
        } catch (err) {
            console.error('Failed to load discussion:', err);
            showToast('Error loading discussion', 'error');
        } finally {
            setLoading(false);
        }
    };

    const validateReply = (): string | null => {
        if (!replyContent.trim()) return 'Reply cannot be empty';
        if (replyContent.trim().length < 5) return 'Reply must be at least 5 characters';
        if (replyContent.trim().length > 2000) return 'Reply cannot exceed 2000 characters';
        return null;
    };

    const handleReply = async () => {
        const error = validateReply();
        if (error) {
            showToast(error, 'warning');
            return;
        }

        if (!discussion) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/forum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
                body: JSON.stringify({
                    courseId: discussion.courseId,
                    userId: user?.id,
                    content: replyContent,
                    parentDiscussionId: threadId,
                    userRole: user?.role,
                }),
            });

            if (res.ok) {
                setReplyContent('');
                fetchDiscussion();
                showToast('Reply posted successfully!', 'success');
            } else {
                const errorMsg = await res.text();
                showToast(errorMsg || 'Failed to post reply', 'error');
            }
        } catch (err) {
            console.error('Error posting reply:', err);
            showToast('Error posting reply', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredRole="student">
                <Navbar />
                <div className={styles.container}>Loading...</div>
            </ProtectedRoute>
        );
    }

    if (!discussion) {
        return (
            <ProtectedRoute requiredRole="student">
                <Navbar />
                <div className={styles.container}>
                    <Card>
                        <p>Discussion not found</p>
                    </Card>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole="student">
            <Navbar />
            <div className={styles.container}>
                <Button variant="outline" onClick={() => window.history.back()}>
                    ← Back to Forum
                </Button>

                {/* Main Discussion */}
                <Card className={styles.mainDiscussion}>
                    <div className={styles.discussionMeta}>
                        <h1>{discussion.title}</h1>
                        <p className={styles.courseMeta}>{discussion.courseName}</p>
                    </div>

                    <div className={styles.authorInfo}>
                        <span className={styles.author}>{discussion.author}</span>
                        <span className={`${styles.role} ${styles[discussion.authorRole]}`}>
                            {discussion.authorRole}
                        </span>
                        <span className={styles.date}>{discussion.createdDate}</span>
                    </div>

                    <div className={styles.discussionContent}>
                        {discussion.content}
                    </div>
                </Card>

                {/* Replies Section */}
                <div className={styles.repliesSection}>
                    <h2>{discussion.replies.length} Replies</h2>

                    {/* Reply Form */}
                    <Card className={styles.replyForm}>
                        <h3>Post a Reply</h3>
                        <textarea
                            className={styles.textarea}
                            placeholder="Share your thoughts..."
                            rows={5}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            maxLength={2000}
                        />
                        <small>{replyContent.length}/2000</small>
                        <Button
                            variant="primary"
                            onClick={handleReply}
                            disabled={submitting || !replyContent.trim()}
                        >
                            {submitting ? 'Posting...' : 'Post Reply'}
                        </Button>
                    </Card>

                    {/* Existing Replies */}
                    <div className={styles.repliesList}>
                        {discussion.replies.filter(r => r.isApproved).map((reply) => (
                            <Card key={reply.id} className={styles.reply}>
                                <div className={styles.replyAuthor}>
                                    <strong>{reply.author}</strong>
                                    <span className={`${styles.role} ${styles[reply.authorRole]}`}>
                                        {reply.authorRole}
                                    </span>
                                    <span className={styles.replyDate}>{reply.createdDate}</span>
                                </div>
                                <p className={styles.replyContent}>{reply.content}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
