'use client';
import Link from 'next/link';
import { useState } from 'react';
import layoutStyles from '../home.module.css';
import styles from './terms.module.css';

export default function TermsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <nav className={layoutStyles.navContainer}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Link href="/" style={{ color: 'var(--primary-blue)', fontWeight: 800, fontSize: '1.5rem' }}>
            LEARNIT
          </Link>

          <button
            className={layoutStyles.hamburger}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`${layoutStyles.navLinks} ${isMenuOpen ? layoutStyles.navLinksOpen : ''}`}>
            <Link href="/#home" onClick={() => setIsMenuOpen(false)}>HOME</Link>
            <Link href="/#how-it-works" onClick={() => setIsMenuOpen(false)}>HOW IT WORKS</Link>
            <Link href="/#why-learnit" onClick={() => setIsMenuOpen(false)}>WHY CHOOSE US</Link>
            <Link href="/register" onClick={() => setIsMenuOpen(false)}>BECOME AN INSTRUCTOR</Link>
          </div>
          <Link href="/login" className="btn-primary">LOGIN</Link>
        </div>
      </nav>

      <section className={styles.termsSection}>
        <div className="container">
          <h1 className={layoutStyles.sectionTitle}>Terms of Service</h1>
          <p className={styles.termsEffectiveDate}>Effective Date: 10th February 2026</p>

          <div className={styles.termsCard}>
            <p className={styles.termsIntro}>
              These Terms of Service govern your access to and use of the LearnIT web-based learning platform.
              By using LearnIT, you agree to these terms. If you do not agree, please do not use the platform.
            </p>

            <ol className={styles.termsList}>
              <li>
                <h3>Acceptance of Terms</h3>
                <p>By creating an account or using LearnIT, you confirm that you have read, understood, and agreed to these terms.</p>
              </li>

              <li>
                <h3>Eligibility &amp; Accounts</h3>
                <ul>
                  <li>You must provide accurate, current information during registration.</li>
                  <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                  <li>You are responsible for all activity that occurs under your account.</li>
                </ul>
              </li>

              <li>
                <h3>Learning Access &amp; Progression</h3>
                <ul>
                  <li>Access to lessons, quizzes, and certificates is subject to your subscription and platform rules.</li>
                  <li>Quiz completion requirements and progression rules must be followed to unlock new topics.</li>
                </ul>
              </li>

              <li>
                <h3>Subscriptions &amp; Payments</h3>
                <ul>
                  <li>Subscription plans, fees, and billing cycles are displayed at the time of purchase.</li>
                  <li>Payments are processed securely through third-party payment providers.</li>
                  <li>Failure to pay may result in limited or suspended access.</li>
                </ul>
              </li>

              <li>
                <h3>Content &amp; Intellectual Property</h3>
                <ul>
                  <li>All LearnIT content, including lessons, quizzes, and certificates, is protected by intellectual property laws.</li>
                  <li>You may use the content for personal educational purposes only.</li>
                  <li>You may not copy, distribute, or resell LearnIT content without written permission.</li>
                </ul>
              </li>

              <li>
                <h3>User Conduct</h3>
                <ul>
                  <li>Do not misuse the platform or attempt to bypass security or access controls.</li>
                  <li>Do not upload or share harmful, offensive, or unlawful content.</li>
                  <li>Do not interfere with the learning experience of other users.</li>
                </ul>
              </li>

              <li>
                <h3>Certificates &amp; Verification</h3>
                <p>Certificates are issued based on completion and performance rules. LearnIT may provide public verification to confirm authenticity.</p>
              </li>

              <li>
                <h3>Third-Party Services</h3>
                <p>LearnIT integrates third-party services (e.g., hosting, payment processing). We are not responsible for their separate terms or practices.</p>
              </li>

              <li>
                <h3>Disclaimers</h3>
                <p>LearnIT is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not guarantee uninterrupted access or error-free operation.</p>
              </li>

              <li>
                <h3>Limitation of Liability</h3>
                <p>To the maximum extent permitted by law, LearnIT is not liable for indirect, incidental, or consequential damages arising from use of the platform.</p>
              </li>

              <li>
                <h3>Termination</h3>
                <p>We may suspend or terminate access if you violate these terms or misuse the platform.</p>
              </li>

              <li>
                <h3>Changes to These Terms</h3>
                <p>We may update these terms from time to time. Continued use of LearnIT indicates acceptance of the revised terms.</p>
              </li>

              <li>
                <h3>Contact Us</h3>
                <p>If you have questions about these Terms of Service, please contact us through the LearnIT support system.</p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <footer className={layoutStyles.footer}>
        <div className="container">
          <div className={layoutStyles.footerGrid}>
            <div>
              <h3 className={layoutStyles.footerBrand}>LEARNIT</h3>
              <p className={layoutStyles.footerDescription}>
                An exam-focused learning platform for O/L &amp; A/L Computer Science and ICT students.
              </p>
            </div>

            <div>
              <h4>EXPLORE</h4>
              <ul>
                <li><Link href="/#home">HOME</Link></li>
                <li><Link href="/#how-it-works">HOW IT WORKS</Link></li>
                <li><Link href="/#why-learnit">WHY CHOOSE US</Link></li>
                <li><Link href="/register">BECOME AN INSTRUCTOR</Link></li>
              </ul>
            </div>

            <div>
              <h4>SUPPORT</h4>
              <ul>
                <li><Link href="/support">Support</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={layoutStyles.footerBottom}>
          <p>(c) {new Date().getFullYear()} LearnIT Education Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
