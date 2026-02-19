'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useToast } from '@/context/ToastContext';

export default function InstructorCourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/courses/${id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load course');
        }
        const course = await res.json();
        setTitle(course.title || '');
        setDescription(course.description || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadCourse();
  }, [id]);

  const handleSubmitUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      setError('Missing course id.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit updates');
      setSuccess(data.message || 'Updates submitted for review');
      showToast(data.message || 'Updates submitted for review', 'success');
    } catch (err: any) {
      const message = err.message || 'Failed to submit updates';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestUnpublish = async () => {
    if (!id) {
      setError('Missing course id.');
      return;
    }
    setRequesting(true);
    setError(null);
    setSuccess(null);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`/api/courses/${id}/unpublish-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit unpublish request');
      setSuccess(data.message || 'Unpublish request submitted');
      setReason('');
      showToast(data.message || 'Unpublish request submitted', 'success');
    } catch (err: any) {
      const message = err.message || 'Failed to submit unpublish request';
      setError(message);
      showToast(message, 'error');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <Navbar />
      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0 }}>Edit Course</h1>
          <Button variant="outline" onClick={() => router.push(`/instructor/courses/${id}`)}>Back to Course</Button>
        </div>

        {loading && <Card><p>Loading course...</p></Card>}
        {error && <Card><p style={{ color: 'red' }}>{error}</p></Card>}
        {success && <Card><p style={{ color: 'green' }}>{success}</p></Card>}

        {!loading && (
          <>
            <Card style={{ marginBottom: '1rem' }}>
              <h3>Submit Updates For Review</h3>
              <p>Submitting changes sends this course back to pending status until admin approval.</p>
              <form onSubmit={handleSubmitUpdates}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Title</label>
                  <input
                    style={{ width: '100%', padding: '0.5rem' }}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label>Description</label>
                  <textarea
                    style={{ width: '100%', minHeight: 120, padding: '0.5rem' }}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button variant="primary" type="submit" disabled={saving || !title.trim()}>
                  {saving ? 'Submitting...' : 'Submit Updates For Review'}
                </Button>
              </form>
            </Card>

            <Card>
              <h3>Request Course Unpublish</h3>
              <p>You must provide a valid reason. Admin will review your request before unpublishing.</p>
              <textarea
                style={{ width: '100%', minHeight: 120, padding: '0.5rem', marginBottom: '0.75rem' }}
                placeholder="Enter the reason for unpublishing this course (minimum 15 characters)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Button
                variant="outline"
                disabled={requesting || reason.trim().length < 15}
                onClick={handleRequestUnpublish}
              >
                {requesting ? 'Submitting...' : 'Request Unpublish'}
              </Button>
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
