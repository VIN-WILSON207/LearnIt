'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href={`/${user.role}/dashboard`} className={styles.logo}>
          LearntIt
        </Link>
        <span className={styles.tagline}>Smart Learning, Better Results</span>

        <button
          className={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`${styles.menu} ${isMenuOpen ? styles.open : ''}`}>
          <Link href={`/${user.role}/dashboard`} className={styles.navItem}>
            Dashboard
          </Link>

          {user.role === 'student' && (
            <>
              <Link href="/student/courses" className={styles.navItem}>
                My Courses
              </Link>
              <Link href="/student/progress" className={styles.navItem}>
                Progress
              </Link>
            </>
          )}

          {user.role === 'professor' && (
            <>
              <Link href="/professor/courses" className={styles.navItem}>
                My Courses
              </Link>
              <Link href="/professor/students" className={styles.navItem}>
                Students
              </Link>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <Link href="/admin/users" className={styles.navItem}>
                Users
              </Link>
              <Link href="/admin/courses" className={styles.navItem}>
                Courses
              </Link>
              <Link href="/admin/analytics" className={styles.navItem}>
                Analytics
              </Link>
            </>
          )}

          <div className={styles.userMenu}>
            <span className={styles.userName}>{user.name}</span>
            <button
              onClick={handleLogout}
              className={styles.logoutBtn}
              title="Logout"
            >
              <FiLogOut />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
