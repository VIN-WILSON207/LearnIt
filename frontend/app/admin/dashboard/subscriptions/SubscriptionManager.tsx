'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import styles from './manager.module.css';

interface Plan {
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
    features: string[];
}

export default function SubscriptionManager() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [formData, setFormData] = useState<Partial<Plan>>({
        name: '', price: 0, duration: 1, description: '', features: []
    });
    const [featureInput, setFeatureInput] = useState('');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/subscriptions/plans', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPlans(data.data || []);
            }
        } catch (err) {
            setError('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        try {
            const res = await fetch(`/api/admin/subscriptions/plans/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                setPlans(prev => prev.filter(p => p.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete');
            }
        } catch (err) {
            alert('Error deleting plan');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingPlan
                ? `/api/admin/subscriptions/plans/${editingPlan.id}`
                : '/api/admin/subscriptions/plans';

            const method = editingPlan ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingPlan(null);
                setFormData({ name: '', price: 0, duration: 1, description: '', features: [] });
                fetchPlans();
            } else {
                const data = await res.json();
                alert(data.error || 'Operation failed');
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        }
    };

    const openEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price,
            duration: plan.duration,
            description: plan.description || '',
            features: plan.features || []
        });
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingPlan(null);
        setFormData({ name: '', price: 0, duration: 1, description: '', features: [] });
        setIsModalOpen(true);
    };

    const addFeature = () => {
        if (!featureInput.trim()) return;
        setFormData(prev => ({ ...prev, features: [...(prev.features || []), featureInput.trim()] }));
        setFeatureInput('');
    };

    const removeFeature = (idx: number) => {
        const newFeatures = [...(formData.features || [])];
        newFeatures.splice(idx, 1);
        setFormData({ ...formData, features: newFeatures });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Manage Subscription Plans</h2>
                <Button variant="primary" onClick={openCreate}>Create New Plan</Button>
            </div>

            <div className={styles.grid}>
                {plans.map(plan => (
                    <Card key={plan.id} className={styles.planCard}>
                        <div className={styles.planHeader}>
                            <h3>{plan.name}</h3>
                            <div className={styles.price}>XAF {plan.price} <span className={styles.duration}>/ {plan.duration} mo</span></div>
                        </div>
                        <p className={styles.description}>{plan.description}</p>
                        <ul className={styles.features}>
                            {plan.features?.map((f, i) => <li key={i}>• {f}</li>)}
                        </ul>
                        <div className={styles.actions}>
                            <Button size="small" variant="outline" onClick={() => openEdit(plan)}>Edit</Button>
                            <Button size="small" variant="danger" onClick={() => handleDelete(plan.id)}>Delete</Button>
                        </div>
                    </Card>
                ))}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3>{editingPlan ? 'Edit Plan' : 'Create Plan'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Plan Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Price (XAF)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Duration (Months)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Features</label>
                                <div className={styles.featureInput}>
                                    <input
                                        type="text"
                                        placeholder="Add a feature..."
                                        value={featureInput}
                                        onChange={e => setFeatureInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                    />
                                    <Button type="button" size="small" onClick={addFeature}>Add</Button>
                                </div>
                                <ul className={styles.featureList}>
                                    {formData.features?.map((f, i) => (
                                        <li key={i}>
                                            {f}
                                            <span className={styles.removeFeature} onClick={() => removeFeature(i)}>×</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.modalActions}>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="primary">Save Plan</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
