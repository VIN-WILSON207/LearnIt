'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
      if (user && user.role) {
        router.push(`/${user.role.toLowerCase()}/dashboard`);
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>LearnIt</h1>
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

            <p className={styles.signupLink}>
              Don't have an account? <Link href="/register">Sign up</Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
