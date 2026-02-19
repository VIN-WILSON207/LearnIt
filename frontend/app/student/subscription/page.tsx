'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FaCheck } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import styles from './subscription.module.css';
import { StudentLayout } from '@/components/StudentLayout';

export default function SubscriptionPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/subscriptions/plans');
                if (res.ok) {
                    const data = await res.json();
                    setPlans(Array.isArray(data) ? data : (data.data || []));
                }
            } catch (err) {
                console.error('Failed to load plans');
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleSubscribe = async (planId: string) => {
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/subscriptions/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ planId })
            });

            if (res.ok) {
                alert('Successfully subscribed!');
                router.push('/student/dashboard');
            } else {
                const errData = await res.json();
                alert(errData.error || 'Subscription failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Error processing subscription');
        }
    };

    return (
        <ProtectedRoute requiredRole="student">
            <Navbar />
            <StudentLayout active="subscriptions">
                <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Subscription Plans</h1>
                    <p className={styles.subtitle}>Simple, Transparent Pricing Tailored For You!</p>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Loading premium plans...</div>
                ) : (
                    <div className={styles.pricingGrid}>
                        {plans.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No subscription plans available at the moment.</p>}
                        {plans.map((plan, idx) => (
                            <div
                                key={plan.id}
                                className={`${styles.card} ${idx === 1 ? styles.popular : ''}`}
                            >
                                {idx === 1 && <div className={styles.popularTag}>Popular</div>}

                                <h2 className={styles.cardName} style={{ color: 'var(--primary-blue)' }}>{plan.name}</h2>
                                <p className={styles.cardDesc} style={{ minHeight: '40px' }}>
                                    {plan.description || 'Access to premium ICT & CS learning resources.'}
                                </p>

                                <div className={styles.priceContainer}>
                                    <span className={styles.currency}>XAF </span>
                                    <span className={styles.amount}>{plan.price}</span>
                                </div>
                                <p className={styles.billingText}>
                                    Billed every {plan.duration} {plan.duration === 1 ? 'month' : 'months'}
                                </p>

                                <button
                                    className={`${styles.button} ${idx === 1 ? styles.btnStandard : styles.btnBasic}`}
                                    onClick={() => handleSubscribe(plan.id)}
                                >
                                    Get started
                                </button>

                                <ul className={styles.featuresList}>
                                    {plan.features && plan.features.length > 0 ? (
                                        plan.features.map((feature: string, fidx: number) => (
                                            <li key={fidx} className={styles.featureItem}>
                                                <FaCheck className={styles.checkIcon} style={{ color: 'var(--success-green)' }} />
                                                {feature}
                                            </li>
                                        ))
                                    ) : (
                                        <>
                                            <li className={styles.featureItem}><FaCheck className={styles.checkIcon} style={{ color: 'var(--success-green)' }} /> Unlimited Course Access</li>
                                            <li className={styles.featureItem}><FaCheck className={styles.checkIcon} style={{ color: 'var(--success-green)' }} /> Certificate Generation</li>
                                            <li className={styles.featureItem}><FaCheck className={styles.checkIcon} style={{ color: 'var(--success-green)' }} /> Community Support</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.backButtonWrapper}>
                    <Button
                        onClick={() => router.back()}
                        style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                    >
                        <FiArrowLeft /> Go Back
                    </Button>
                </div>
                </div>
            </StudentLayout>
        </ProtectedRoute>
    );
}
