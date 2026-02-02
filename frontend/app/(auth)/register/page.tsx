'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import styles from '../login/page.module.css';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('STUDENT');
    const [level, setLevel] = useState<'AL' | 'OL'>('AL');
    const [subject, setSubject] = useState('ICT');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, user } = useAuth();
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push(`/${user.role.toLowerCase()}/dashboard`);
        }
    }, [user, router]);

    // Update subject when level changes
    useEffect(() => {
        if (level === 'OL') {
            setSubject('Computer Science');
        } else if (level === 'AL') {
            setSubject('ICT');
        }
    }, [level]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const registrationData: any = { name, email, password, role };
            if (role === 'STUDENT') {
                registrationData.level = level;
                registrationData.subject = subject;
            }
            await register(registrationData);
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

                        {/* Show level & subject only if role is STUDENT */}
                        {role === 'STUDENT' && (
                            <>
                                <div className={styles.formGroup}>
                                    <label htmlFor="level">Level</label>
                                    <select
                                        id="level"
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value as 'AL' | 'OL')}
                                        className={styles.select}
                                    >
                                        <option value="AL">Advanced Level</option>
                                        <option value="OL">Ordinary Level</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="subject">Subject</label>
                                    <select
                                        id="subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className={styles.select}
                                    >
                                        {level === 'AL' && (
                                            <>
                                                <option value="ICT">ICT</option>
                                                <option value="Computer Science">Computer Science</option>
                                            </>
                                        )}
                                        {level === 'OL' && (
                                            <option value="Computer Science">Computer Science</option>
                                        )}
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
