'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';

interface NavbarProps {
  hideMenu?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ hideMenu = false }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isStudent = (user?.role || '').toLowerCase() === 'student';
  const isInstructor = (user?.role || '').toLowerCase() === 'instructor';

  const handleLogout = () => {
    logout();
    router.push('/');
  };


  if (!user) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href={`/${user.role.toLowerCase()}/dashboard`} className={styles.logo}>
          LearnIt
        </Link>

        {!hideMenu && !isStudent && !isInstructor && (
          <button
            className={styles.menuToggle}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        )}

        <span className={styles.tagline}>Smart Learning, Better Results</span>
      </div>
    </nav>
  );
};
