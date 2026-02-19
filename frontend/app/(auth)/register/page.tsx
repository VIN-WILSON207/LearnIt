'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import styles from '../login/page.module.css';

type Subject = {
    id: string;
    name: string;
};

type Level = {
    id: string;
    name: string;
    subjects?: Subject[];
};

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('STUDENT');
    const [levelId, setLevelId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [levels, setLevels] = useState<Level[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push(`/${user.role.toLowerCase()}/dashboard`);
        }
    }, [user, router]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/auth/register-config');
                if (res.ok) {
                    const data = (await res.json()) as Level[];
                    setLevels(data);
                    if (Array.isArray(data) && data.length > 0) {
                        setLevelId(data[0].id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch register config:', err);
            }
        };
        fetchConfig();
    }, []);

    const selectedLevel = levels.find(l => l.id === levelId);
    const isOrdinaryLevel = selectedLevel?.name === 'Ordinary Level';

    const allowedSubjects = useMemo<Subject[]>(() => {
        const subjects = selectedLevel?.subjects || [];
        const allowedNames = isOrdinaryLevel
            ? ['Computer Science']
            : ['Computer Science', 'ICT'];

        const filtered = subjects.filter((subject) => allowedNames.includes(subject.name));
        const uniqueByName = new Map(filtered.map((subject) => [subject.name, subject]));
        return Array.from(uniqueByName.values());
    }, [selectedLevel, isOrdinaryLevel]);

    useEffect(() => {
        if (allowedSubjects.length === 0) {
            return;
        }

        const isCurrentAllowed = allowedSubjects.some((subject) => subject.id === subjectId);
        if (!isCurrentAllowed) {
            setSubjectId(allowedSubjects[0].id);
        }
    }, [levelId, allowedSubjects, subjectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Pass arguments in the order AuthContext expects: (name, email, password, role?, levelId?)
            // levelId is optional; backend accepts undefined (use seeded levels or add level lookup later)
            const levelId = undefined;
            await register(name, email, password, role, levelId);
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>LearnIt</h1>
                    <p>Join Smart Learning Today</p>
                </div>

                <Card className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <h2>Create Account</h2>

                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.formGroup}>
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                className={styles.select}
                            >
                                <option value="STUDENT">Student</option>
                                <option value="INSTRUCTOR">Instructor</option>
                            </select>
                        </div>

                        {role === 'STUDENT' && (
                            <>
                                <div className={styles.formGroup}>
                                    <label htmlFor="level">Level</label>
                                    <select
                                        id="level"
                                        value={levelId}
                                        onChange={(e) => setLevelId(e.target.value)}
                                        className={styles.select}
                                    >
                                        {levels.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="subject">Subject</label>
                                    <select
                                        id="subject"
                                        value={subjectId}
                                        onChange={(e) => setSubjectId(e.target.value)}
                                        className={styles.select}
                                        disabled={isOrdinaryLevel}
                                    >
                                        {allowedSubjects.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <Button type="submit" disabled={isLoading} className={styles.submitBtn}>
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Button>

                        <div className={styles.footerLink}>
                            <p className={styles.link}>
                                Already have an account? <a href="/login">Sign In</a>
                            </p>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
