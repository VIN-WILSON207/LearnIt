'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [devToken, setDevToken] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to request password reset');
                return;
            }

            setSuccess(data.message || 'If your email exists a reset link was sent.');
            if (data.resetToken) {
                setDevToken(data.resetToken);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to request password reset');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content} style={{ maxWidth: 640, margin: '0 auto' }}>
                <div className={styles.header}>
                    <h1>Forgot Password</h1>
                    <p>Enter your email to receive a password reset link.</p>
                </div>

                <Card className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}
                        {success && <div className={styles.success}>{success}</div>}

                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>

                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Button variant="outline" onClick={() => router.push('/login')} disabled={isLoading}>Back</Button>
                            <Button variant="primary" type="submit" disabled={isLoading || !email}>
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </div>

                        {devToken && (
                            <div style={{ marginTop: 16 }}>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Development reset token (visible because SMTP is not configured):</p>
                                <code style={{ wordBreak: 'break-all' }}>{devToken}</code>
                                <div style={{ marginTop: 8 }}>
                                    <Button variant="primary" onClick={() => router.push(`/reset-password?token=${devToken}`)}>Go to Reset Page</Button>
                                </div>
                            </div>
                        )}
                    </form>
                </Card>
            </div>
        </div>
    );
}
