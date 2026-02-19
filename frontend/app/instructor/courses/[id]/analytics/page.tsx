'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export default function InstructorCourseAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/analytics/course/${id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load analytics');
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadAnalytics();
  }, [id]);

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <Navbar />
      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0 }}>Course Analytics</h1>
          <Button variant="outline" onClick={() => router.push(`/instructor/courses/${id}`)}>Back to Course</Button>
        </div>

        {loading && <Card><p>Loading analytics...</p></Card>}
        {error && <Card><p style={{ color: 'red' }}>{error}</p></Card>}

        {!loading && !error && data && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <Card>
              <h3>{data.courseName || 'Course'}</h3>
              <p>Course ID: {data.courseId}</p>
            </Card>
            <Card>
              <h3>Enrollments</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>{data.enrollmentCount ?? 0}</p>
            </Card>
            <Card>
              <h3>Average Completion</h3>
              <p style={{ fontSize: '2rem', margin: 0 }}>
                {Math.round(Number(data.avgCompletionPercentage || 0))}%
              </p>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
