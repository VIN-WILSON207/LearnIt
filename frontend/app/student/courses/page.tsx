'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { mockCourses } from '@/lib/mockData';
import styles from './page.module.css';
import { FiStar, FiClock, FiUsers } from 'react-icons/fi';
import { Button } from '@/components/Button';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setCourses(mockCourses);
  }, []);

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(c => c.category === filter);

  const categories = Array.from(new Set(courses.map(c => c.category)));

  return (
    <ProtectedRoute requiredRole="student">
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Available Courses</h1>
          <p>Explore and enroll in new courses</p>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All Courses
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`${styles.filterBtn} ${filter === cat ? styles.active : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className={styles.coursesGrid}>
          {filteredCourses.map(course => (
            <Card key={course.id} className={styles.courseCard}>
              <img 
                src={course.image} 
                alt={course.title} 
                className={styles.courseImage}
              />
              <div className={styles.courseContent}>
                <h3>{course.title}</h3>
                <p className={styles.courseDesc}>{course.description}</p>
                
                <div className={styles.courseMeta}>
                  <div className={styles.metaItem}>
                    <FiClock />
                    <span>{course.duration}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <FiUsers />
                    <span>{course.students} enrolled</span>
                  </div>
                </div>

                <div className={styles.courseFooter}>
                  <div className={styles.rating}>
                    <FiStar />
                    <span>{course.rating}</span>
                  </div>
                  <Button variant="primary" size="small">
                    Enroll Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
