'use client';

import { useEffect, useState } from 'react';
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
  user: { id: string; name: string; email: string };
  responses: Array<{
    id: string;
    response: string;
    createdAt: string;
    admin: { name: string; email: string };
  }>;
}

export default function AdminSupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/support', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        setToast({ type: 'error', message: 'Failed to load support messages' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error loading messages' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async (messageId: string) => {
    if (!responseText.trim()) {
      setToast({ type: 'error', message: 'Please enter a response' });
      return;
    }

    setSubmittingResponse(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/support/${messageId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ response: responseText }),
      });

      if (res.ok) {
        setToast({ type: 'success', message: 'Response sent successfully!' });
        setResponseText('');
        await loadMessages();
        // Reload selected message to show new response
        if (selectedMessage) {
          const updatedMsg = messages.find(m => m.id === selectedMessage.id);
          if (updatedMsg) setSelectedMessage(updatedMsg);
        }
      } else {
        setToast({ type: 'error', message: 'Failed to send response' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error sending response' });
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleCloseMessage = async (messageId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/support/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: 'CLOSED' }),
      });

      if (res.ok) {
        setToast({ type: 'success', message: 'Message closed successfully' });
        await loadMessages();
        setSelectedMessage(null);
      } else {
        setToast({ type: 'error', message: 'Failed to close message' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error closing message' });
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'open') return msg.status === 'OPEN';
    if (filter === 'closed') return msg.status === 'CLOSED';
    return true;
  });

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Support Messages</h1>
        <p>Manage customer support requests</p>
      </div>

      <div className={styles.filterButtons}>
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({messages.length})
        </Button>
        <Button
          variant={filter === 'open' ? 'primary' : 'outline'}
          onClick={() => setFilter('open')}
        >
          Open ({messages.filter(m => m.status === 'OPEN').length})
        </Button>
        <Button
          variant={filter === 'closed' ? 'primary' : 'outline'}
          onClick={() => setFilter('closed')}
        >
          Closed ({messages.filter(m => m.status === 'CLOSED').length})
        </Button>
      </div>

      <div className={styles.adminContent}>
        <div className={styles.messagesList}>
          <Card>
            <h2>Messages</h2>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#999' }}>Loading messages...</p>
            ) : filteredMessages.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999' }}>No messages found</p>
            ) : (
              <div className={styles.list}>
                {filteredMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`${styles.listItem} ${selectedMessage?.id === msg.id ? styles.active : ''}`}
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <div className={styles.listItemHeader}>
                      <h4>{msg.subject}</h4>
                      <span className={`${styles.status} ${styles[msg.status.toLowerCase()]}`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className={styles.listItemUser}>{msg.user.name}</p>
                    <p className={styles.listItemDate}>
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className={styles.messageDetail}>
          {selectedMessage ? (
            <Card>
              <div className={styles.detailHeader}>
                <div>
                  <h2>{selectedMessage.subject}</h2>
                  <p className={styles.userInfo}>
                    <strong>From:</strong> {selectedMessage.user.name} ({selectedMessage.user.email})
                  </p>
                </div>
                <span className={`${styles.status} ${styles[selectedMessage.status.toLowerCase()]}`}>
                  {selectedMessage.status}
                </span>
              </div>

              <div className={styles.messageBody}>
                <p>{selectedMessage.message}</p>
                <p className={styles.sentTime}>
                  Sent: {new Date(selectedMessage.createdAt).toLocaleDateString()} at{' '}
                  {new Date(selectedMessage.createdAt).toLocaleTimeString()}
                </p>
              </div>

              {selectedMessage.responses.length > 0 && (
                <div className={styles.responses}>
                  <h3>Responses:</h3>
                  {selectedMessage.responses.map(resp => (
                    <div key={resp.id} className={styles.response}>
                      <p className={styles.adminResponse}>{resp.response}</p>
                      <p className={styles.responseInfo}>
                        By {resp.admin.name} on{' '}
                        {new Date(resp.createdAt).toLocaleDateString()} at{' '}
                        {new Date(resp.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedMessage.status === 'OPEN' && (
                <div className={styles.responseForm}>
                  <h3>Send Response</h3>
                  <textarea
                    placeholder="Type your response here..."
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    rows={4}
                    disabled={submittingResponse}
                  />
                  <div className={styles.formActions}>
                    <Button
                      onClick={() => handleSendResponse(selectedMessage.id)}
                      disabled={submittingResponse}
                    >
                      {submittingResponse ? 'Sending...' : 'Send Response'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCloseMessage(selectedMessage.id)}
                    >
                      Close Message
                    </Button>
                  </div>
                </div>
              )}

              {selectedMessage.status === 'CLOSED' && (
                <div className={styles.closedMessage}>
                  <p>This message has been closed.</p>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <p style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>
                Select a message to view details and respond
              </p>
            </Card>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)} id={''} />
      )}
    </div>
  );
}
