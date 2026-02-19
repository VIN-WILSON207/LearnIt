'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function CoursePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lessons = useMemo(() => (Array.isArray(course?.lessons) ? course.lessons : []), [course]);
  const isPdf = (url?: string | null) => Boolean(url && url.toLowerCase().includes('.pdf'));

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

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const res = await fetch(`/api/courses/${id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load course');
        setCourse(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadCourse();
  }, [id]);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    if (user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
      return;
    }

    if (user?.role === 'INSTRUCTOR') {
      router.push(`/instructor/courses/${id}`);
      return;
    }

    router.push('/student/courses');
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0 }}>Course Preview</h1>
          <Button variant="outline" onClick={handleBack}>Back</Button>
        </div>

        {loading && <Card><p>Loading...</p></Card>}
        {error && <Card><p style={{ color: 'red' }}>{error}</p></Card>}

        {!loading && !error && course && (
          <>
            <Card style={{ marginBottom: '1rem' }}>
              <h2>{course.title}</h2>
              {course.description ? (
                <div className={styles.descriptionList}>
                  {getDescriptionLines(course.description).map((line: string, index: number) => (
                    <p key={index} className={styles.descriptionItem}>{line}</p>
                  ))}
                </div>
              ) : (
                <p>No description provided.</p>
              )}
              <p><strong>Status:</strong> {course.isPublished ? 'Published' : 'Pending Admin Approval'}</p>
              <p><strong>Instructor:</strong> {course.instructor?.name || 'N/A'}</p>
            </Card>

            <Card>
              <h3>Lessons</h3>
              {lessons.length === 0 ? (
                <p>No lessons uploaded yet.</p>
              ) : (
                <ol>
                  {lessons.map((lesson: any) => (
                    <li key={lesson.id} style={{ marginBottom: '0.75rem' }}>
                      <strong>{lesson.title}</strong>
                      <div style={{ fontSize: '0.9rem', color: '#555' }}>
                        {lesson.videoUrl ? 'Video attached' : 'No video'} | {lesson.attachmentUrl ? 'Document attached' : 'No document'}
                      </div>
                      {lesson.attachmentUrl && (
                        <div style={{ marginTop: '0.35rem' }}>
                          <a href={lesson.attachmentUrl} target="_blank" rel="noreferrer">
                            View document
                          </a>
                        </div>
                      )}
                      {lesson.attachmentUrl && isPdf(lesson.attachmentUrl) && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <iframe
                            title={`${lesson.title} document`}
                            src={lesson.attachmentUrl}
                            style={{ width: '100%', height: 420, border: '1px solid #e5e7eb', borderRadius: 8 }}
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
