'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import styles from './page.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>LearntIt</h1>
          <p>Smart Learning, Better Results</p>
        </div>

        <Card className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Sign In</h2>

            {error && <div className={styles.error}>{error}</div>}

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
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className={styles.submitBtn}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className={styles.demoInfo}>
              <h3>Demo Credentials:</h3>
              <ul>
                <li><strong>Student:</strong> student@example.com / student123</li>
                <li><strong>Professor:</strong> professor@example.com / professor123</li>
                <li><strong>Admin:</strong> admin@example.com / admin123</li>
              </ul>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
