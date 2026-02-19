'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './support.module.css';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import Toast from '@/components/Toast';

interface SupportMessage {
  id: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  responses?: Array<{
    id: string;
    response: string;
    createdAt: string;
    admin?: { name: string; email: string };
  }>;
}

export default function SupportPage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [myMessages, setMyMessages] = useState<SupportMessage[]>([]);
  const [showMyMessages, setShowMyMessages] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      setToast({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ subject, message }),
      });

      if (res.ok) {
        setToast({ type: 'success', message: 'Message sent successfully! Our team will respond shortly.' });
        setSubject('');
        setMessage('');
        // Reload messages after sending
        loadMyMessages();
      } else {
        setToast({ type: 'error', message: 'Failed to send message' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error sending message' });
    } finally {
      setLoading(false);
    }
  };

  const loadMyMessages = async () => {
    setLoadingMessages(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/support/my', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (res.ok) {
        const data = await res.json();
        setMyMessages(data);
      }
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const toggleMyMessages = async () => {
    if (!showMyMessages) {
      await loadMyMessages();
    }
    setShowMyMessages(!showMyMessages);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Contact Support Team</h1>
        <p>We're here to help! Send us a message about any issues or questions you have.</p>
      </div>

      <div className={styles.content}>
        <div className={styles.formSection}>
          <Card>
            <h2>Send a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  placeholder="Please describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Card>
        </div>

        <div className={styles.messagesSection}>
          <Card>
            <h2>My Messages</h2>
            <Button
              variant="outline"
              onClick={toggleMyMessages}
              style={{ marginBottom: '20px' }}
            >
              {showMyMessages ? 'Hide Messages' : 'View My Messages'}
            </Button>

            {showMyMessages && (
              <div className={styles.messagesList}>
                {loadingMessages ? (
                  <p style={{ textAlign: 'center', color: '#999' }}>Loading messages...</p>
                ) : myMessages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#999' }}>No messages yet</p>
                ) : (
                  myMessages.map((msg) => (
                    <div key={msg.id} className={styles.messageItem}>
                      <div className={styles.messageHeader}>
                        <h3>{msg.subject}</h3>
                        <span className={`${styles.status} ${styles[msg.status.toLowerCase()]}`}>
                          {msg.status}
                        </span>
                      </div>
                      <p className={styles.messageText}>{msg.message}</p>
                      <p className={styles.timestamp}>
                        Sent: {new Date(msg.createdAt).toLocaleDateString()} at{' '}
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>

                      {msg.responses && msg.responses.length > 0 && (
                        <div className={styles.responses}>
                          <h4>Responses:</h4>
                          {msg.responses.map((resp) => (
                            <div key={resp.id} className={styles.response}>
                              <p className={styles.adminReply}>
                                <strong>Support Team:</strong> {resp.response}
                              </p>
                              <p className={styles.responseTime}>
                                {new Date(resp.createdAt).toLocaleDateString()} at{' '}
                                {new Date(resp.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
