'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/Button';
import styles from './create-course.module.css';

type Subject = {
    id: string;
    code: string;
    name: string;
};

const ALLOWED_SUBJECT_CODES = ['CS-OL', 'CS-AL', 'ICT-AL'] as const;

const SUBJECT_LABEL_BY_CODE: Record<(typeof ALLOWED_SUBJECT_CODES)[number], string> = {
    'CS-OL': 'Ordinary level computer science',
    'CS-AL': 'Advanced level computer science',
    'ICT-AL': 'Advanced level ICT',
};

const UPLOAD_CONCURRENCY = 2;

type LessonUploadItem = {
    file: File;
    isVideo: boolean;
    orderNumber: number;
};

export default function CreateCoursePage() {
    const router = useRouter();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [docFiles, setDocFiles] = useState<File[]>([]);
    const [creating, setCreating] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{ msg: string, progress: number } | null>(null);

    const formatNumberedDescription = (value: string) => {
        if (!value) return value;
        return value.replace(/(\d+\.)\s+/g, (match, numberToken, offset, full) => {
            const prevChar = offset > 0 ? full[offset - 1] : '';
            if (offset === 0 || prevChar === '\n') {
                return `${numberToken} `;
            }
            return `\n${numberToken} `;
        });
    };

    useEffect(() => {
        const loadSubjects = async () => {
            try {
                const res = await fetch('/api/config/subjects');
                if (!res.ok) return;
                const data = await res.json();
                const dataSubjects = data as Subject[];
                const filteredSubjects = ALLOWED_SUBJECT_CODES
                    .map((code) => dataSubjects.find((subject) => subject.code === code))
                    .filter((subject): subject is Subject => Boolean(subject));
                setSubjects(filteredSubjects);
                if (filteredSubjects.length) setSubjectId(filteredSubjects[0].id);
            } catch (err) {
                console.error('Failed to load subjects:', err);
            }
        };

        loadSubjects();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || creating) return;

        setCreating(true);
        setUploadStatus({ msg: 'Creating course...', progress: 10 });

        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');

            // Create course
            const createRes = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    title,
                    description,
                    subjectId,
                    instructorId: user.id,
                }),
            });

            if (!createRes.ok) {
                const err = await createRes.json();
                throw new Error(err.error || 'Failed to create course');
            }

            const created = await createRes.json();
            setUploadStatus({ msg: 'Course created. Uploading lessons...', progress: 30 });

            const uploadItems: LessonUploadItem[] = [
                ...videoFiles.map((file, index) => ({
                    file,
                    isVideo: true,
                    orderNumber: index + 1,
                })),
                ...docFiles.map((file, index) => ({
                    file,
                    isVideo: false,
                    orderNumber: videoFiles.length + index + 1,
                })),
            ];

            if (uploadItems.length > 0) {
                const totalBytes = uploadItems.reduce((sum, item) => sum + item.file.size, 0) || 1;
                const uploadedBytesByOrder = new Map<number, number>();
                let completed = 0;
                let nextIndex = 0;

                const updateProgress = (msg: string) => {
                    const uploadedBytes = Array.from(uploadedBytesByOrder.values()).reduce((sum, bytes) => sum + bytes, 0);
                    const weightedProgress = Math.floor((uploadedBytes / totalBytes) * 70);
                    const progress = Math.min(99, 30 + weightedProgress);
                    setUploadStatus({ msg, progress });
                };

                const uploadLesson = async (item: LessonUploadItem) => {
                    const form = new FormData();
                    form.append('courseId', created.id);
                    form.append('title', item.file.name.split('.')[0]);
                    form.append('content', item.isVideo ? 'Lesson Video' : 'Lesson Document');
                    form.append('orderNumber', String(item.orderNumber));
                    form.append('isFree', 'false');
                    form.append(item.isVideo ? 'video' : 'attachment', item.file);

                    updateProgress(`Uploading ${completed + 1}/${uploadItems.length}: ${item.file.name}`);

                    const res = await fetch('/api/courses/lesson', {
                        method: 'POST',
                        headers: {
                            Authorization: token ? `Bearer ${token}` : '',
                        },
                        body: form,
                    });

                    if (!res.ok) {
                        let errorMessage = `Failed to upload ${item.file.name}`;
                        try {
                            const data = await res.json();
                            if (data?.error) errorMessage = data.error;
                        } catch {
                            // keep fallback error message
                        }
                        throw new Error(errorMessage);
                    }

                    uploadedBytesByOrder.set(item.orderNumber, item.file.size);
                    completed += 1;
                    updateProgress(`Uploaded ${completed}/${uploadItems.length}: ${item.file.name}`);
                };

                const worker = async () => {
                    while (nextIndex < uploadItems.length) {
                        const current = nextIndex;
                        nextIndex += 1;
                        await uploadLesson(uploadItems[current]);
                    }
                };

                const workerCount = Math.min(UPLOAD_CONCURRENCY, uploadItems.length);
                await Promise.all(Array.from({ length: workerCount }, () => worker()));
            } else {
                throw new Error('No lesson files selected. Add at least one video or document before publishing.');
            }

            setUploadStatus({ msg: 'Done!', progress: 100 });
            setTimeout(() => {
                router.push('/instructor/dashboard');
            }, 1000);

        } catch (err: any) {
            alert(err.message || 'Failed to create course');
            setUploadStatus(null);
        } finally {
            setCreating(false);
        }
    };

    return (
        <ProtectedRoute requiredRole="INSTRUCTOR">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Create Excellence</h1>
                    <p>Design your syllabus and share your expertise with the world</p>
                </div>

                <div className={styles.card}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formSection}>
                            <h3>✨ General Information</h3>
                            <div className={styles.formGroup}>
                                <label>Course Title</label>
                                <input
                                    className={styles.input}
                                    placeholder="e.g. Master Computer Networks for Beginners"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="What will students learn in this course?"
                                    value={description}
                                    onChange={(e) => setDescription(formatNumberedDescription(e.target.value))}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Subject</label>
                                <select
                                    className={styles.select}
                                    value={subjectId}
                                    onChange={(e) => setSubjectId(e.target.value)}
                                    required
                                >
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {SUBJECT_LABEL_BY_CODE[s.code as keyof typeof SUBJECT_LABEL_BY_CODE] ?? s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3>📹 Course Content</h3>
                            <div className={styles.formGroup}>
                                <label>Upload Video Lessons</label>
                                <div className={styles.fileUploadArea} onClick={() => document.getElementById('videoInput')?.click()}>
                                    <p>Click to upload lesson videos</p>
                                    <input
                                        id="videoInput"
                                        type="file"
                                        hidden
                                        multiple
                                        accept="video/*"
                                        onChange={(e) => setVideoFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
                                    />
                                    {videoFiles.length > 0 && (
                                        <div className={styles.fileList}>
                                            {videoFiles.map((f, i) => (
                                                <span key={i} className={styles.fileItem}>🎥 {f.name}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Additional Resources (PDFs, Docs)</label>
                                <div className={styles.fileUploadArea} onClick={() => document.getElementById('docInput')?.click()}>
                                    <p>Click to upload documents</p>
                                    <input
                                        id="docInput"
                                        type="file"
                                        hidden
                                        multiple
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setDocFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
                                    />
                                    {docFiles.length > 0 && (
                                        <div className={styles.fileList}>
                                            {docFiles.map((f, i) => (
                                                <span key={i} className={styles.fileItem}>📄 {f.name}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <Button variant="outline" type="button" onClick={() => router.back()} disabled={creating}>
                                Discard
                            </Button>
                            <Button className={styles.submitBtn} variant="primary" type="submit" disabled={creating || !title.trim()}>
                                {creating ? 'Publishing...' : 'Publish Course'}
                            </Button>
                        </div>
                    </form>
                </div>

                {uploadStatus && (
                    <div className={styles.uploadProgress}>
                        <p><strong>{uploadStatus.msg}</strong></p>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${uploadStatus.progress}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
