'use client';

import React, { useState, useEffect } from 'react';
import styles from './ForumDiscussion.module.css';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';

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
  title: string;
  author: string;
  authorRole: 'student' | 'instructor' | 'admin';
  content: string;
  createdDate: string;
  replies: Reply[];
  isModerated: boolean;
  minPlanAccess: string;
}

interface ForumDiscussionProps {
  courseId: string;
}

const ForumDiscussion: React.FC<ForumDiscussionProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchDiscussions();
  }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      const res = await fetch(`/api/forum?courseId=${courseId}`);
      const data = await res.json();
      setDiscussions(data);
    } catch (error) {
      console.error('Failed to fetch discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!newTopic.trim() || !newContent.trim()) return;

    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          userId: user?.id,
          title: newTopic,
          content: newContent,
          userRole: user?.role,
        }),
      });

      if (res.ok) {
        setNewTopic('');
        setNewContent('');
        fetchDiscussions();
      }
    } catch (error) {
      console.error('Failed to create discussion:', error);
    }
  };

  const handleReply = async (discussionId: string) => {
    if (!replyContent.trim()) return;

    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          userId: user?.id,
          content: replyContent,
          parentDiscussionId: discussionId,
          userRole: user?.role,
        }),
      });

      if (res.ok) {
        setReplyContent('');
        fetchDiscussions();
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading discussions...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Course Discussions</h2>
        <p>Ask questions, share insights, and connect with your peers</p>
      </div>

      {/* Create New Discussion */}
      <div className={styles.createSection}>
        <h3>Start a New Discussion</h3>
        <input
          type="text"
          className={styles.topicInput}
          placeholder="What's your topic?"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
        />
        <textarea
          className={styles.contentInput}
          placeholder="Share your question or thought..."
          rows={4}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <Button onClick={handleCreateDiscussion}>Post Discussion</Button>
      </div>

      {/* Discussions List */}
      <div className={styles.discussionsList}>
        {discussions.length === 0 ? (
          <div className={styles.empty}>
            <p>No discussions yet. Be the first to start a discussion!</p>
          </div>
        ) : (
          discussions.map((discussion) => (
            <div key={discussion.id} className={styles.discussion}>
              <div className={styles.discussionHeader}>
                <div className={styles.titleSection}>
                  <h4>{discussion.title}</h4>
                  <span className={`${styles.role} ${styles[discussion.authorRole]}`}>
                    {discussion.authorRole}
                  </span>
                </div>
                <span className={styles.date}>{discussion.createdDate}</span>
              </div>

              <div className={styles.author}>
                By <strong>{discussion.author}</strong>
              </div>

              <p className={styles.content}>{discussion.content}</p>

              <div className={styles.repliesSection}>
                <div className={styles.repliesHeader}>
                  <h5>{discussion.replies.length} Replies</h5>
                  <button
                    className={styles.toggleBtn}
                    onClick={() =>
                      setSelectedDiscussion(
                        selectedDiscussion === discussion.id ? null : discussion.id
                      )
                    }
                  >
                    {selectedDiscussion === discussion.id ? '▼ Hide' : '▶ Show'}
                  </button>
                </div>

                {selectedDiscussion === discussion.id && (
                  <>
                    {/* Existing Replies */}
                    <div className={styles.replies}>
                      {discussion.replies
                        .filter(r => r.isApproved)
                        .map((reply) => (
                          <div key={reply.id} className={styles.reply}>
                            <div className={styles.replyMeta}>
                              <strong>{reply.author}</strong>
                              <span
                                className={`${styles.replyRole} ${styles[reply.authorRole]}`}
                              >
                                {reply.authorRole}
                              </span>
                              <span className={styles.replyDate}>{reply.createdDate}</span>
                            </div>
                            <p className={styles.replyContent}>{reply.content}</p>
                          </div>
                        ))}
                    </div>

                    {/* Add Reply */}
                    <div className={styles.addReply}>
                      <textarea
                        className={styles.replyInput}
                        placeholder="Write your reply..."
                        rows={3}
                        value={
                          selectedDiscussion === discussion.id ? replyContent : ''
                        }
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                      <Button
                        onClick={() => handleReply(discussion.id)}
                        size="small"
                      >
                        Reply
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ForumDiscussion;
