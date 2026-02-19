'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import styles from './home.module.css';
import './globals.css';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <nav className={styles.navContainer}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2 style={{ color: 'var(--primary-blue)', fontWeight: 800 }}>LEARNIT</h2>

          {/* Hamburger button */}
          <button
            className={styles.hamburger}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation links */}
          <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
            <Link href="#home" onClick={() => setIsMenuOpen(false)}>HOME</Link>
            <Link href="#how-it-works" onClick={() => setIsMenuOpen(false)}>HOW IT WORKS</Link>
            <Link href="#why-learnit" onClick={() => setIsMenuOpen(false)}>WHY CHOOSE US</Link>
            <Link href="/register" onClick={() => setIsMenuOpen(false)}>BECOME AN INSTRUCTOR</Link>
          </div>
          <Link href="/login" className="btn-primary">LOGIN</Link>
        </div>
      </nav>


      {/* Hero Section */}
      <section className={styles.heroSection} id="home">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Master Computer Science & ICT with Confidence
          </h1>
          <p>
            Structured, exam-focused learning for O/L & A/L students. Track your progress, pass mandatory quizzes,
            and earn your certificate, all aligned with the Sri Lankan syllabus.
          </p>
        </div>

        <div className={styles.heroImageContainer}>
          <Image
            src="/background.webp"
            alt="Students learning ICT online"
            fill
            priority
          />
        </div>
      </section>

      {/* PATH SELECTION */}
      <section className={styles.pathSelection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Choose Your Learning Path</h2>
          <p className={styles.pathIntro}>Whether you're a student preparing for exams or an instructor ready to share your expertise, we've built the perfect platform for you.</p>
        </div>

        <div className={styles.paths}>
          {/* <!-- Student Path --> */}
          <div className={styles.pathCard} data-path="student">
            <h3>I am a Student</h3>
            <p className={styles.subtitle}>Get exam-ready with structured lessons, mandatory quizzes, and real-time progress tracking</p>

            <ul className={styles.pathFeatures}>
              <li>
                <span className={styles.checkIcon}>✔</span>
                <span>Access step-by-step lessons aligned with O/L & A/L syllabus</span>
              </li>
              <li>
                <span className={styles.checkIcon}>✔</span>
                <span>Pass mandatory quizzes to unlock new topics</span>
              </li>
              <li>
                <span className={styles.checkIcon}>✔</span>
                <span>Track your progress with real-time analytics</span>
              </li>
              <li>
                <span className={styles.checkIcon}>✔</span>
                <span>Earn performance-based certificates</span>
              </li>
              <li>
                <span className={styles.checkIcon}>✔</span>
                <span>Limited free access before subscription</span>
              </li>
            </ul>

            <Link href="/register" className={styles.pathCta}> Start Learning Now → </Link>
          </div>

          {/* INSTRUCTOR PATH */}
          <div className={styles.pathCard} data-path="instructor">
            <h3>I am an Instructor</h3>
            <p className={styles.subtitle}>Share your expertise, create engaging content, and help students excel in their exams</p>

            <ul className={styles.pathFeatures}>
              <li>
                <span className={styles.checkIcon}>✔</span>
                <span>Create and publish structured lesson content</span>
              </li>
              <li>
                <span className={styles.checkIcon}>✔</span>
                <span>Design quizzes and assessments for students</span>
              </li>
              <li>
                <span className={styles.checkIcon}>✔</span>
                <span>Track student progress and engagement</span>
              </li>
              <li>
                <span className={styles.checkIcon}>✔</span>
                <span>Monetize your teaching with flexible pricing</span>
              </li>
              <li>
                <span className={styles.checkIcon}>✔</span>
                <span>Join a community of expert educators</span>
              </li>
            </ul>

            <Link href="/register" className={styles.pathCta}> Become An Instructor → </Link>
          </div>
        </div>
      </section>


      {/* HOW IT WORKS */}
      < section className={styles.howItWorks} id="how-it-works" >
        <div className="container">
          <h2 className={styles.sectionTitle}>
            How LearnIT Helps You Succeed
          </h2>

          <div className={styles.stepsGrid}>
            {/* Step 1 */}
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>1</span>
              <h3>Learn Step-by-Step</h3>
              <p>
                Follow structured lessons designed to match your exam syllabus.
              </p>
            </div>

            {/* Step 2 */}
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>2</span>
              <h3>Take Mandatory Quizzes</h3>
              <p>
                Every lesson includes quizzes you must pass to unlock the next topic.
              </p>
            </div>

            {/* Step 3 */}
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>3</span>
              <h3>Track Your Progress</h3>
              <p>
                See your performance, quiz scores, and completion percentage in real time.
              </p>
            </div>

            {/* Step 4 */}
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>4</span>
              <h3>Earn Your Certificate</h3>
              <p>
                Complete topics successfully and download your performance-based certificate.
              </p>
            </div>
          </div>
        </div>
      </section >


      {/* WHY LEARNIT */}
      < section id="why-learnit" className={styles.whyLearnIt} >
        <div className="container">
          <h2 className={styles.sectionTitle}>
            Why Students Choose LearnIT
          </h2>

          <div className={styles.whyGrid}>
            <div className={styles.whyItem}>
              <span className={styles.checkIcon}>✔</span>
              <p>Exam-oriented lesson structure</p>
            </div>

            <div className={styles.whyItem}>
              <span className={styles.checkIcon}>✔</span>
              <p>Mandatory quizzes for true understanding</p>
            </div>

            <div className={styles.whyItem}>
              <span className={styles.checkIcon}>✔</span>
              <p>Limited free access before subscription</p>
            </div>

            <div className={styles.whyItem}>
              <span className={styles.checkIcon}>✔</span>
              <p>Instructor-created content</p>
            </div>

            <div className={styles.whyItem}>
              <span className={styles.checkIcon}>✔</span>
              <p>Real-time progress analytics</p>
            </div>

            <div className={styles.whyItem}>
              <span className={styles.checkIcon}>✔</span>
              <p>Certificates based on performance</p>
            </div>
          </div>
        </div>
      </section >


      {/* TESTIMONIALS */}
      < section className={styles.testimonials} >
        <div className="container">
          <h2 className={styles.sectionTitle}>
            What Students Say About LearnIT
          </h2>

          <div className={styles.testimonialGrid}>
            <div className={styles.testimonialCard}>
              <p>
                “LearnIT helped me understand programming logic clearly and
                pass my A/L exams with confidence.”
              </p>
              <span className={styles.author}>
                — A/L Computer Science Student
              </span>
            </div>

            <div className={styles.testimonialCard}>
              <p>
                “The quizzes forced me to really understand each lesson before
                moving forward. It made a big difference.”
              </p>
              <span className={styles.author}>
                — O/L ICT Student
              </span>
            </div>

            <div className={styles.testimonialCard}>
              <p>
                “I liked how progress tracking showed exactly where I was
                weak and what I needed to improve.”
              </p>
              <span className={styles.author}>
                — A/L ICT Student
              </span>
            </div>
          </div>
        </div>
      </section >


      {/* CTA */}
      < section className={styles.finalCta} >
        <div className="container">
          <h2>Start Your Learning Journey Today</h2>
          <p>
            Join students mastering Computer Science and ICT with structured,
            exam-focused learning on LearnIT.
          </p>

          <Link href="/register" className="btn-cta"> Get Started Now </Link>
        </div>
      </section >


      {/* FOOTER */}
      < footer className={styles.footer} >
        <div className="container">
          <div className={styles.footerGrid}>
            {/* Brand */}
            <div>
              <h3 className={styles.footerBrand}>LEARNIT</h3>
              <p className={styles.footerDescription}>
                An exam-focused learning platform for O/L & A/L Computer Science and ICT students.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4>EXPLORE</h4>
              <ul>
                <li><Link href="#home">HOME</Link></li>
                <li><Link href="#how-it-works">HOW IT WORKS</Link></li>
                <li><Link href="#why-learnit">WHY CHOOSE US</Link></li>
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

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} LearnIT. All rights reserved.</p>
        </div>
      </footer >
    </div >
  );
}


