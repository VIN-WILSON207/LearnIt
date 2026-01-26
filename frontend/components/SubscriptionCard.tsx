'use client';

import React, { useState, useEffect } from 'react';
import styles from './SubscriptionCard.module.css';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';

interface SubscriptionPlanProps {
  plan: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  isCurrentPlan?: boolean;
  onUpgrade?: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionPlanProps> = ({
  plan,
  name,
  price,
  currency,
  features,
  isCurrentPlan = false,
  onUpgrade,
}) => {
  return (
    <div className={`${styles.card} ${isCurrentPlan ? styles.current : ''}`}>
      {isCurrentPlan && <span className={styles.badge}>Current Plan</span>}
      <h3 className={styles.planName}>{name}</h3>
      <div className={styles.price}>
        <span className={styles.amount}>{price === 0 ? 'Free' : `${currency} ${price}`}</span>
        {price > 0 && <span className={styles.period}>/month</span>}
      </div>
      <ul className={styles.features}>
        {features.map((feature, index) => (
          <li key={index}>
            <span className={styles.check}>✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Button
        onClick={onUpgrade}
        variant={isCurrentPlan ? 'secondary' : 'primary'}
        disabled={isCurrentPlan}
        fullWidth
      >
        {isCurrentPlan ? 'Current Plan' : `Upgrade to ${name}`}
      </Button>
    </div>
  );
};

export const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlanProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/subscriptions/upgrade');
        const data = await res.json();
        setPlans(data.plans);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleUpgrade = (planId: string) => {
    console.log(`Upgrade to ${planId} initiated`);
    // In real app, redirect to payment gateway
    window.location.href = `/checkout?plan=${planId}`;
  };

  if (loading) {
    return <div className={styles.loading}>Loading plans...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Choose Your Plan</h2>
        <p>Select the perfect plan for your learning journey</p>
      </div>
      <div className={styles.grid}>
        {plans.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            {...plan}
            isCurrentPlan={user?.subscription?.plan === plan.id}
            onUpgrade={() => handleUpgrade(plan.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionCard;
