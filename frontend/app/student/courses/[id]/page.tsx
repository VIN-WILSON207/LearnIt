'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import styles from './page.module.css';
import { StudentLayout } from '@/components/StudentLayout';

export default function CoursePlayer() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    const [course, setCourse] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const isPdf = (url?: string | null) => Boolean(url && url.toLowerCase().includes('.pdf'));

    useEffect(() => {
        if (id) loadCourseData();
    }, [id]);

    const loadCourseData = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const headers = { Authorization: token ? `Bearer ${token}` : '' };

            // 1. Fetch Course Details
            const courseRes = await fetch(`/api/courses/${id}`, { headers });
            if (!courseRes.ok) throw new Error('Failed to load course');
            const courseData = await courseRes.json();
            setCourse(courseData);

            if (courseData.lessons && courseData.lessons.length > 0) {
                setCurrentLesson(courseData.lessons[0]);
            }

            // 2. Fetch User Progress (Simple implementation: assume progress tracks percent)
            // Real implementation might need detailed lesson-level tracking
            const progRes = await fetch(`/api/progress/${id}`, { headers });
            if (progRes.ok) {
                const progData = await progRes.json();
                setProgress(progData);
                // Heuristic: If 100%, all marked. If 0%, none.
                // For a real app, we'd need a 'completedLessons' array in the progress model.
                // For now, we'll track locally for the session or assume linear progress based on percent.
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonComplete = async () => {
        if (!course || !currentLesson) return;

        // Calculate new percent
        // This is a simplified logic. In strict mode, we'd track exactly which IDs are done.
        const totalLessons = course.lessons.length;
        const newCompleted = new Set(completedLessons).add(currentLesson.id);
        const percent = Math.floor((newCompleted.size / totalLessons) * 100); // Fixed arithmetic logic for demo

        // For the sake of this demo, let's just increment progress by "snippet"
        // Better: Find current lesson index, if it's the last one, 100%.
        const currentIndex = course.lessons.findIndex((l: any) => l.id === currentLesson.id);
        const isLastFn = currentIndex === course.lessons.length - 1;
        const newPercent = isLastFn ? 100 : Math.round(((currentIndex + 1) / totalLessons) * 100);

        try {
            const token = localStorage.getItem('token');
            await fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    courseId: course.id,
                    percent: newPercent
                })
            });

            setProgress({ ...progress, percent: newPercent });
            setCompletedLessons(newCompleted); // Update local state

            if (newPercent === 100) {
                alert('Course Completed! Certificate Generated.');
            } else {
                // Auto-advance
                if (!isLastFn) {
                    setCurrentLesson(course.lessons[currentIndex + 1]);
                }
            }

        } catch (err) {
            console.error('Failed to update progress');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <ProtectedRoute requiredRole="student">
            <Navbar />
            <StudentLayout active="courses">
                <div className={styles.container}>
                    <div className={styles.sidebar}>
                        <h3>{course.title}</h3>
                        <div className={styles.progressContainer}>
                            <div className={styles.progressBar} style={{ width: `${progress?.percent || 0}%` }}></div>
                        </div>
                        <ul className={styles.lessonList}>
                            {course.lessons?.map((lesson: any, idx: number) => (
                                <li
                                    key={lesson.id}
                                    className={`${styles.lessonItem} ${currentLesson?.id === lesson.id ? styles.active : ''}`}
                                    onClick={() => setCurrentLesson(lesson)}
                                >
                                    {idx + 1}. {lesson.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={styles.contentArea}>
                        {currentLesson ? (
                            <Card className={styles.playerCard}>
                                <h2>{currentLesson.title}</h2>
                                {currentLesson.videoUrl && (
                                    <video controls src={currentLesson.videoUrl} className={styles.videoPlayer} />
                                )}
                                {currentLesson.attachmentUrl && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <a href={currentLesson.attachmentUrl} target="_blank" rel="noreferrer">
                                            View lesson document
                                        </a>
                                    </div>
                                )}
                                {currentLesson.attachmentUrl && isPdf(currentLesson.attachmentUrl) && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <iframe
                                            title={`${currentLesson.title} document`}
                                            src={currentLesson.attachmentUrl}
                                            style={{ width: '100%', height: 420, border: '1px solid #e5e7eb', borderRadius: 8 }}
                                        />
                                    </div>
                                )}
                                <div className={styles.lessonContent}>
                                    {currentLesson.content}
                                </div>
                                <div className={styles.actions}>
                                    <Button onClick={handleLessonComplete} variant="primary">
                                        Mark as Complete & Continue
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <div className={styles.emptyState}>Select a lesson to start</div>
                        )}
                    </div>
                </div>
            </StudentLayout>
        </ProtectedRoute>
    );
}
