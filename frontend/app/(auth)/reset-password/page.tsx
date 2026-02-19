'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import styles from '../login/page.module.css';

function ResetPasswordContent() {
    const router = useRouter();
    const params = useSearchParams();
    const queryToken = params?.get('token') || '';

    const [token, setToken] = useState(queryToken);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (queryToken) setToken(queryToken);
    }, [queryToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!token) return setError('Reset token is required');
        if (newPassword.length < 6) return setError('Password must be at least 6 characters');
        if (newPassword !== confirmPassword) return setError('Passwords do not match');

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken: token, newPassword }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to reset password');
                return;
            }

            setSuccess('Password reset successfully. Redirecting to login...');
            setTimeout(() => router.push('/login'), 1500);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content} style={{ maxWidth: 720, margin: '0 auto' }}>
                <div className={styles.header}>
                    <h1>Reset Password</h1>
                    <p>Enter a new password for your account.</p>
                </div>

                <Card className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}
                        {success && <div className={styles.success}>{success}</div>}

                        <div className={styles.formGroup}>
                            <label>Reset Token</label>
                            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste token here if not in link" />
                        </div>

                        <div className={styles.formGroup}>
                            <label>New Password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" required />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Confirm Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" required />
                        </div>

                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Button variant="outline" onClick={() => router.push('/login')} disabled={isLoading}>Cancel</Button>
                            <Button variant="primary" type="submit" disabled={isLoading || !token || !newPassword || !confirmPassword}>
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
