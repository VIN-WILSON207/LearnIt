'use client';
import Link from 'next/link';
import { useState } from 'react';
import layoutStyles from '../home.module.css';
import styles from './privacy.module.css';
import privacyStyles from './privacy.module.css';

export default function PrivacyPage() {
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

      <section className={privacyStyles.privacySection}>
        <div className="container">
          <h1 className={layoutStyles.sectionTitle}>Privacy Policy</h1>
          <p className={privacyStyles.privacyEffectiveDate}>Effective Date: 10th February 2026</p>

          <div className={privacyStyles.privacyCard}>
            <p className={privacyStyles.privacyIntro}>
              LearnIT is committed to protecting your privacy. This Privacy Policy explains how we collect, use,
              store, and protect your information when you use the LearnIT web-based learning platform.
            </p>
            <p className={privacyStyles.privacyIntro}>
              By using LearnIT, you agree to the practices described in this Privacy Policy.
            </p>

            <ol className={privacyStyles.privacyList}>
              <li>
                <h3>Information We Collect</h3>
                <p>We collect only the information necessary to provide and improve our educational services.</p>
                <div className={privacyStyles.privacySubsection}>
                  <h4>1.1 Personal Information</h4>
                  <ul>
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Password (securely encrypted)</li>
                    <li>Academic level (O/L or A/L)</li>
                    <li>Selected subject (Computer Science or ICT)</li>
                  </ul>
                </div>
                <div className={privacyStyles.privacySubsection}>
                  <h4>1.2 Learning &amp; Usage Data</h4>
                  <ul>
                    <li>Lesson progress and completion status</li>
                    <li>Quiz attempts, scores, and performance data</li>
                    <li>Certificate eligibility and issuance records</li>
                    <li>Subscription status and plan details</li>
                  </ul>
                </div>
              </li>

              <li>
                <h3>How We Use Your Information</h3>
                <ul>
                  <li>Provide access to lessons, quizzes, and certificates</li>
                  <li>Track academic progress and performance</li>
                  <li>Enforce quiz and progression rules</li>
                  <li>Manage subscriptions and access control</li>
                  <li>Communicate important updates and support responses</li>
                  <li>Improve platform performance and user experience</li>
                  <li>Ensure system security and prevent misuse</li>
                </ul>
                <p className={privacyStyles.privacyNote}>We do not use your data for advertising purposes.</p>
              </li>

              <li>
                <h3>Data Storage &amp; Security</h3>
                <ul>
                  <li>All user data is stored securely in protected databases.</li>
                  <li>Passwords are encrypted using industry-standard hashing techniques.</li>
                  <li>Access to sensitive data is restricted to authorized personnel only.</li>
                  <li>Media files are securely stored using third-party cloud storage services (e.g., Cloudinary).</li>
                  <li>We take reasonable technical and organizational measures to protect your data from unauthorized access, loss, or misuse.</li>
                </ul>
              </li>

              <li>
                <h3>Sharing of Information</h3>
                <p>We do not sell, trade, or rent your personal information.</p>
                <ul>
                  <li>With trusted service providers (e.g., hosting, payment processing) strictly for operational purposes</li>
                  <li>When required by law or legal obligation</li>
                  <li>To protect the rights, safety, or integrity of LearnIT and its users</li>
                </ul>
              </li>

              <li>
                <h3>Subscriptions &amp; Payments</h3>
                <p>Payment-related data is handled securely through third-party payment providers. LearnIT does not store full payment card details on its servers.</p>
              </li>

              <li>
                <h3>Certificates &amp; Public Verification</h3>
                <p>Certificates issued by LearnIT may include:</p>
                <ul>
                  <li>Student name</li>
                  <li>Course or topic completed</li>
                  <li>Date of issuance</li>
                  <li>Performance-based validation</li>
                </ul>
                <p>Certificate verification may be publicly accessible for authenticity purposes but will not expose sensitive personal data.</p>
              </li>

              <li>
                <h3>Student Privacy &amp; Educational Use</h3>
                <ul>
                  <li>Used strictly for learning and progress evaluation</li>
                  <li>Never shared for marketing or profiling</li>
                  <li>Never used for automated decision-making beyond academic progression rules</li>
                </ul>
              </li>

              <li>
                <h3>Cookies</h3>
                <p>LearnIT may use cookies or similar technologies to:</p>
                <ul>
                  <li>Maintain authentication sessions</li>
                  <li>Improve platform functionality</li>
                </ul>
                <p>You may disable cookies in your browser, but some features may not function correctly.</p>
              </li>

              <li>
                <h3>Your Rights</h3>
                <ul>
                  <li>Access your personal data</li>
                  <li>Update or correct your information</li>
                  <li>Request account deletion (subject to academic record retention requirements)</li>
                  <li>Contact support regarding data concerns</li>
                </ul>
                <p>Requests can be made via the LearnIT support system.</p>
              </li>

              <li>
                <h3>Data Retention</h3>
                <ul>
                  <li>While your account is active</li>
                  <li>As required to maintain academic records and certificates</li>
                  <li>As required by legal or administrative obligations</li>
                </ul>
                <p>Inactive or deleted accounts may have data anonymized where appropriate.</p>
              </li>

              <li>
                <h3>Third-Party Links</h3>
                <p>LearnIT may contain links to external websites (e.g., community resources). We are not responsible for the privacy practices of third-party sites.</p>
              </li>

              <li>
                <h3>Changes to This Policy</h3>
                <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.</p>
                <p>Continued use of LearnIT after changes indicates acceptance of the revised policy.</p>
              </li>

              <li>
                <h3>Contact Us</h3>
                <p>If you have questions or concerns about this Privacy Policy or your data, please contact us through the LearnIT support system.</p>
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
