'use client';

import React, { useState, useEffect } from 'react';
import styles from './ProgressDashboard.module.css';
import { useAuth } from '@/context/AuthContext';

const ProgressDashboard: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/progress?userId=${user.id}`);
        const data = await res.json();
        setProgress(data);
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  if (loading || !progress) {
    return <div className={styles.loading}>Loading your progress...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Your Learning Progress</h2>
        <p>Keep track of your educational journey</p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Courses Enrolled</p>
            <p className={styles.statValue}>{progress.coursesEnrolled}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✓</div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Courses Completed</p>
            <p className={styles.statValue}>{progress.coursesCompleted}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎓</div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Certificates Earned</p>
            <p className={styles.statValue}>{progress.certificatesEarned}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Current Streak</p>
            <p className={styles.statValue}>{progress.currentStreak} days</p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className={styles.overallProgress}>
        <h3>Overall Progress</h3>
        <div className={styles.progressBar}>
          <div
            className={styles.fill}
            style={{ width: `${progress.averageProgress}%` }}
          ></div>
        </div>
        <p className={styles.progressText}>{progress.averageProgress}% Complete</p>
        <p className={styles.timeText}>
          Total Time Spent: {Math.round(progress.totalTimeSpent / 60)} hours
        </p>
      </div>

      {/* Courses in Progress */}
      <div className={styles.coursesSection}>
        <h3>Courses in Progress</h3>
        <div className={styles.coursesList}>
          {progress.coursesInProgress && progress.coursesInProgress.length > 0 ? (
            progress.coursesInProgress.map((course: any) => (
              <div key={course.courseId} className={styles.courseCard}>
                <div className={styles.courseHeader}>
                  <h4>{course.title}</h4>
                  <span className={styles.progressPercent}>{course.progress}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.fill}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className={styles.courseStats}>
                  <span>
                    Modules: {course.modulesCompleted}/{course.totalModules}
                  </span>
                  <span>Time Spent: {Math.round(course.timeSpent / 60)}h</span>
                  <span>Last: {course.lastAccessed}</span>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.empty}>No courses in progress yet.</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className={styles.recommendationsSection}>
        <h3>Next Steps</h3>
        <div className={styles.recommendations}>
          <div className={styles.recommendation}>
            <span className={styles.icon}>📖</span>
            <p>Continue with your incomplete courses to maintain your streak</p>
          </div>
          <div className={styles.recommendation}>
            <span className={styles.icon}>⭐</span>
            <p>Take quizzes to test your knowledge and reinforce learning</p>
          </div>
          <div className={styles.recommendation}>
            <span className={styles.icon}>🎯</span>
            <p>Complete more courses to unlock new certificates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
