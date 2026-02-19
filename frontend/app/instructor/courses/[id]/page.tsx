'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import styles from './page.module.css';

export default function InstructorCourseViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load course');
        }

        setCourse(await res.json());
      } catch (err: any) {
        setError(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadCourse();
  }, [id]);

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <Navbar />
      <div style={{ maxWidth: 960, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0 }}>Course Preview</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => router.push('/instructor/dashboard')}>Back</Button>
            <Button variant="outline" onClick={() => router.push(`/instructor/courses/${id}/analytics`)}>Analytics</Button>
            <Button variant="primary" onClick={() => router.push(`/instructor/courses/${id}/edit`)}>Edit</Button>
          </div>
        </div>

        {loading && <Card><p>Loading course...</p></Card>}
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
              <p><strong>Subject:</strong> {course.subject?.name || 'N/A'}</p>
            </Card>

            <Card>
              <h3>Lessons</h3>
              {!course.lessons?.length ? (
                <p>No lessons uploaded yet.</p>
              ) : (
                <ol>
                  {course.lessons.map((lesson: any) => (
                    <li key={lesson.id} style={{ marginBottom: '0.75rem' }}>
                      <div><strong>{lesson.title}</strong></div>
                      <div>{lesson.content || 'No content text.'}</div>
                      <div style={{ fontSize: '0.9rem' }}>
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
