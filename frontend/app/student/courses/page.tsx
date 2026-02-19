'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import styles from './page.module.css';
import { FiStar, FiClock, FiUsers } from 'react-icons/fi';
import { Button } from '@/components/Button';
import { StudentLayout } from '@/components/StudentLayout';

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: token ? `Bearer ${token}` : '' };

        // Parallel fetch: courses + user enrollments
        const [coursesRes, enrollRes] = await Promise.all([
          fetch('/api/courses', { headers }),
          user?.id ? fetch(`/api/enrollments?studentId=${user.id}`, { headers }) : Promise.resolve(null)
        ]);

        if (coursesRes.ok) {
          setCourses(await coursesRes.json());
        }

        if (enrollRes && enrollRes.ok) {
          const enrollments = await enrollRes.json();
          setEnrolledCourseIds(new Set(enrollments.map((e: any) => e.courseId)));
        }

      } catch (err) {
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    // If already enrolled, go to course
    if (enrolledCourseIds.has(courseId)) {
      router.push(`/student/courses/${courseId}`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ studentId: user?.id, courseId })
      });

      if (res.ok) {
        setEnrolledCourseIds(prev => new Set(prev).add(courseId));
        router.push(`/student/courses/${courseId}`);
      } else {
        alert('Failed to enroll');
      }
    } catch (err) {
      console.error(err);
      alert('Error enrolling');
    }
  };

  const filteredCourses = filter === 'all'
    ? courses
    : courses.filter(c => c.subject?.name === filter);

  const categories = Array.from(new Set(courses.map(c => c.subject?.name).filter(Boolean)));

  const getDescriptionLines = (raw: string) => {
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

  const toggleCourse = (courseId: string) => {
    setExpandedCourseId(prev => (prev === courseId ? null : courseId));
  };

  return (
    <ProtectedRoute requiredRole="student">
      <Navbar />
      <StudentLayout active="courses">
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Available Courses</h1>
            <p>Explore and enroll in new courses</p>
          </div>

          {/* Filters */}
          <div className={styles.filters}>
            <button
              className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => router.push('/student/dashboard')}
            >
              All Courses
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${filter === cat ? styles.active : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          <div className={styles.coursesGrid}>
            {filteredCourses.map(course => {
              const isEnrolled = enrolledCourseIds.has(course.id);
              return (
                <Card
                  key={course.id}
                  className={styles.courseCard}
                  onClick={() => toggleCourse(course.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleCourse(course.id);
                    }
                  }}
                >
                  <img
                    src={course.image || 'https://via.placeholder.com/300x200?text=Course+Image'}
                    alt={course.title}
                    className={styles.courseImage}
                  />
                  <div className={styles.courseContent}>
                    <h3>{course.title}</h3>
                    {expandedCourseId === course.id && course.description && (
                      <div className={styles.courseDesc}>
                        {getDescriptionLines(course.description).map((line: string, index: number) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    )}

                    <div className={styles.courseMeta}>
                      <div className={styles.metaItem}>
                        <FiClock />
                        <span>{course.duration || '4 weeks'}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <FiUsers />
                        <span>{course.students || 0} enrolled</span>
                      </div>
                    </div>

                    <div className={styles.courseFooter}>
                      <div className={styles.rating}>
                        <FiStar />
                        <span>{course.rating || '4.5'}</span>
                      </div>
                      <Button
                        variant={isEnrolled ? "outline" : "primary"}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnroll(course.id);
                        }}
                      >
                        {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </StudentLayout>
    </ProtectedRoute>
  );
}
