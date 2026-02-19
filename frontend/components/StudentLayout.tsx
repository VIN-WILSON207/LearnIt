'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import styles from './StudentLayout.module.css';

type ActiveKey =
  | 'dashboard'
  | 'courses'
  | 'progress'
  | 'community'
  | 'subscriptions'
  | 'support';

const NAV_ITEMS: { key: ActiveKey; label: string; href: string }[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/student/dashboard' },
  { key: 'courses', label: 'Courses', href: '/student/courses' },
  { key: 'progress', label: 'Progress', href: '/student/progress' },
  { key: 'community', label: 'Community', href: '/student/forum' },
  { key: 'subscriptions', label: 'Subscriptions', href: '/student/subscription' },
  { key: 'support', label: 'Support', href: '/support' },
];

export function StudentLayout({
  children,
  active,
}: {
  children: React.ReactNode;
  active: ActiveKey;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={styles.studentLayout}>
      {/* Mobile Menu Button */}
      <button
        className={styles.mobileMenuButton}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>Student</div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`${styles.navItem} ${active === item.key ? styles.active : ''}`}
              onClick={() => {
                router.push(item.href);
                setIsMobileMenuOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.userSummary}>{user?.name}</div>
          <div className={styles.roleBadge}>Student</div>
          <button
            className={styles.logoutButton}
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                logout();
                router.push('/');
              }
            }}
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
