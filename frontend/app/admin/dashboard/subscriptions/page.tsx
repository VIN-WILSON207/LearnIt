'use client';

import { useState, useEffect } from 'react';
import styles from './subscriptions.module.css';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import Toast from '@/components/Toast';
import { FiTrash2, FiEdit2, FiPlus } from 'react-icons/fi';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface FormData {
  name: string;
  price: string;
  duration: string;
}

export default function SubscriptionsManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    duration: '',
  });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/subscriptions', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      } else {
        setToast({ type: 'error', message: 'Failed to load subscription plans' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error loading subscription plans' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', duration: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (plan: Plan) => {
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration: plan.duration.toString(),
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price || !formData.duration) {
      setToast({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    const price = parseFloat(formData.price);
    const duration = parseInt(formData.duration);

    if (price <= 0 || duration <= 0) {
      setToast({ type: 'error', message: 'Price and duration must be greater than 0' });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/admin/subscriptions/${editingId}` : '/api/admin/subscriptions';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          name: formData.name,
          price,
          duration,
        }),
      });

      if (res.ok) {
        setToast({
          type: 'success',
          message: editingId ? 'Plan updated successfully!' : 'Plan created successfully!',
        });
        resetForm();
        await loadPlans();
      } else {
        const errorData = await res.json();
        setToast({ type: 'error', message: errorData.error || 'Failed to save plan' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error saving plan' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (res.ok) {
        setToast({ type: 'success', message: 'Plan deleted successfully!' });
        await loadPlans();
      } else {
        const errorData = await res.json();
        setToast({ type: 'error', message: errorData.error || 'Failed to delete plan' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error deleting plan' });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Subscription Plans</h1>
          <p>Create and manage subscription plans for students</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <FiPlus /> {showForm ? 'Cancel' : 'New Plan'}
        </Button>
      </div>

      {/* Form Section */}
      {showForm && (
        <Card className={styles.formCard}>
          <h2>{editingId ? 'Edit Plan' : 'Create New Plan'}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Plan Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g., Premium, Basic, Pro"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={submitting}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="price">Price (USD)</label>
                <input
                  id="price"
                  type="number"
                  placeholder="e.g., 29.99"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  disabled={submitting}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="duration">Duration (Days)</label>
                <input
                  id="duration"
                  type="number"
                  placeholder="e.g., 30"
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Plan'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Plans Grid */}
      <div className={styles.plansGrid}>
        {loading ? (
          <Card className={styles.loadingCard}>
            <p>Loading plans...</p>
          </Card>
        ) : plans.length === 0 ? (
          <Card className={styles.emptyCard}>
            <h3>No subscription plans yet</h3>
            <p>Click "New Plan" to create your first subscription plan</p>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className={styles.planCard}>
              <div className={styles.planHeader}>
                <div>
                  <h3>{plan.name}</h3>
                  <p className={styles.planDuration}>{plan.duration} days</p>
                </div>
                <div className={styles.planPrice}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>{plan.price.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.planMeta}>
                <p>
                  <strong>${(plan.price / plan.duration).toFixed(2)}</strong> per day
                </p>
              </div>

              <div className={styles.planActions}>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleEdit(plan)}
                >
                  <FiEdit2 /> Edit
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDelete(plan.id)}
                >
                  <FiTrash2 /> Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {plans.length > 0 && (
        <Card className={styles.statsCard}>
          <h3>Plans Overview</h3>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Total Plans</span>
              <span className={styles.statValue}>{plans.length}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Most Expensive</span>
              <span className={styles.statValue}>
                ${Math.max(...plans.map((p) => p.price)).toFixed(2)}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Most Affordable</span>
              <span className={styles.statValue}>
                ${Math.min(...plans.map((p) => p.price)).toFixed(2)}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Average Duration</span>
              <span className={styles.statValue}>
                {(plans.reduce((sum, p) => sum + p.duration, 0) / plans.length).toFixed(0)} days
              </span>
            </div>
          </div>
        </Card>
      )}

      {toast && (
        <Toast
          id="toast"
          message={toast.message}
          type={toast.type}
          duration={4000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
